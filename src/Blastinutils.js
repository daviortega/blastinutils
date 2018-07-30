'use strict'

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

module.exports =
class Blastinutils {
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

	parseTabularData(line, params = this.params.parseBlast.format) {
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
