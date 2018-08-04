'use strict'

const Writable = require('stream').Writable

const kDefaults = {
	blastp: {
		numBlastThreads: 4,
		outputFormat: '"6 qseqid sseqid bitscore pident evalue qlen length"',
		maxEvalue: 1,
		maxTargetSeqs: 1000
	},
	makeblastdb: {
		dbtype: 'prot'
	},
	parseBlast: {
		format: [
			'qseqid',
			'sseqid',
			'bitscore',
			'pident',
			'evalue',
			'qlen',
			'length'
		]
	}
}

class CommandsToolKit {
	constructor(params = {}) {
		this.params = params
		this.params.blastp = this.params.blastp || [
			['num_threads', kDefaults.blastp.numBlastThreads],
			['outfmt', kDefaults.blastp.outputFormat],
			['evalue', kDefaults.blastp.maxEvalue],
			['max_target_seqs', kDefaults.blastp.maxTargetSeqs]
		]

		this.params.makeblastdb = this.params.makeblastdb || [
			['dbtype', kDefaults.makeblastdb.dbtype]
		]
		this.params.parseBlast = this.params.parseBlast || kDefaults.parseBlast
	}

	setNewParams(params) {
		this.params = params
	}

	getParams() {
		return this.params
	}

	addParams(params) {
		let additionalParams = ''
		params.forEach((paramPair) => {
			additionalParams += ` -${paramPair.join(' ')}`
		})
		return additionalParams
	}

	buildBlastpCommand(db, query, outputFile, params = this.params.blastp) {
		let command = `blastp -db ${db} -query ${query} -out ${outputFile}`
		command += this.addParams(params)
		return command
	}

	buildMakeDatabaseCommand(inFile, outFile, params = this.params.makeblastdb) {
		let command = `makeblastdb -in ${inFile} -out ${outFile}`
		command += this.addParams(params)
		return command
	}
}

class Parser {
	parseTabularData(line, params = kDefaults.parseBlast.format) {
		const lineList = line.replace('\n').split('\t')
		const object = {}
		if (lineList.length === params.length) {
			params.forEach((key, i) => {
				const value = lineList[i]
				if (isNaN(Number(value)))
					object[key] = lineList[i]
				else
					object[key] = Number(value)
			})
			return JSON.parse(JSON.stringify(object))
		}
		return line
	}
}

class NodesAndLinksStream extends Writable {
	constructor() {
		super({objectMode: true})
		this.maxLogEvalue = 200
		this.buffer = ''
		this.nodes = []
		this.links = []
	}

	addNode(identifier) {
		this.nodes.push(identifier)
	}

	addLink(lineObject) {
		const link = {
			s: this.nodes.indexOf(lineObject.qseqid),
			t: this.nodes.indexOf(lineObject.sseqid),
			e: (lineObject.evalue === 0.0 ? this.maxLogEvalue : -Math.log10(lineObject.evalue).toFixed(2))
		}
		const existingLinks = this.links.filter((oldLink) => {
			return oldLink.s === link.s && oldLink.t === link.t
		})
		if (existingLinks.length === 0) {
			this.links.push(link)
		}
		else if (existingLinks[0].e < link.e) {
			const index = this.links.indexOf(existingLinks[0])
			this.links[index] = link
		}

	}

	processNewChunk(chunk) {
		const parser = new Parser()
		if (chunk) {
			this.buffer += chunk.toString() || ''
			const lines = this.buffer.split('\n')
			this.buffer = lines.pop()
			for (const line of lines) {
				const parsedLine = parser.parseTabularData(line)
				if (typeof parsedLine === 'object') {
					if (this.nodes.indexOf(parsedLine.qseqid) === -1)
						this.addNode(parsedLine.qseqid)
					if (this.nodes.indexOf(parsedLine.sseqid) === -1)
						this.addNode(parsedLine.sseqid)
					this.addLink(parsedLine)
				}
				else {
					console.error(line)
					this.emit('error', new Error ('BLAST data seems to be corrupt.'))
				}
			}
		}
	}

	_write(chunk, enc, next) {
		this.processNewChunk(chunk)
		next()
	}

	_final(next) {
		this.processNewChunk()
		this.emit('finish')
		next()
	}
}


module.exports = {
	CommandsToolKit,
	NodesAndLinksStream,
	Parser
}