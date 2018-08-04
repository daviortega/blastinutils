'use strict'
const fs = require('fs')
const expect = require('chai').expect

const Blastinutils = require('./Blastinutils')

const kDefaults = {
	numBlastThreads: 4,
	outputFormat: '"6 qseqid sseqid bitscore pident evalue qlen length"',
	maxEvalue: 1,
	maxTargetSeqs: 1000
}

describe('Blastinutils', function() {
	describe('CommandsToolKit', function() {
		describe('setNewParams and getParams', function() {
			it('should change params', function() {
				const newParams = {
					not: 'a good param'
				}
				const commandsTk = new Blastinutils.CommandsToolKit()
				const defaultParams = commandsTk.getParams()
				commandsTk.setNewParams(newParams)
				expect(commandsTk.getParams()).to.be.not.eql(defaultParams)
				expect(commandsTk.getParams()).to.be.eql(newParams)
			})
		})
		describe('buildBlastpCommand', function() {
			it('should build a command using default params', function() {
				const expectedCommand = 'blastp -db mydb -query myquery -out myoutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1 -max_target_seqs 1000'
				const commandsTk = new Blastinutils.CommandsToolKit()
				const command = commandsTk.buildBlastpCommand('mydb', 'myquery', 'myoutputFile.dat')
				expect(command).eql(expectedCommand)
			})
			it('should be able to change default commands during initialization', function() {
				const blastpParams = [
					['num_threads', kDefaults.numBlastThreads],
					['outfmt', kDefaults.outputFormat],
					['evalue', 1E-10],
					['max_target_seqs', 1001]
				]
				const params = {
					blastp: blastpParams
				}
				const expectedCommandOne = 'blastp -db mydb -query myquery -out myoutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1e-10 -max_target_seqs 1001'
				const commandsTk = new Blastinutils.CommandsToolKit(params)
				const commandOne = commandsTk.buildBlastpCommand('mydb', 'myquery', 'myoutputFile.dat')
				expect(commandOne).eql(expectedCommandOne)
				const expectedCommandTwo = 'blastp -db myOtherDb -query myOtherQuery -out myOtherOutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1e-10 -max_target_seqs 1001'
				const commandTwo = commandsTk.buildBlastpCommand('myOtherDb', 'myOtherQuery', 'myOtherOutputFile.dat')
				expect(commandTwo).eql(expectedCommandTwo)
			})
			it('should be able to change default commands during function call', function() {
				const blastpParams = [
					['num_threads', kDefaults.numBlastThreads],
					['outfmt', kDefaults.outputFormat],
					['evalue', 1E-10],
					['max_target_seqs', 1001]
				]
				const expectedCommandOne = 'blastp -db mydb -query myquery -out myoutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1 -max_target_seqs 1000'
				const commandsTk = new Blastinutils.CommandsToolKit()
				const commandOne = commandsTk.buildBlastpCommand('mydb', 'myquery', 'myoutputFile.dat')
				expect(commandOne).eql(expectedCommandOne)
				const expectedCommandTwo = 'blastp -db myOtherDb -query myOtherQuery -out myOtherOutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1e-10 -max_target_seqs 1001'
				const commandTwo = commandsTk.buildBlastpCommand('myOtherDb', 'myOtherQuery', 'myOtherOutputFile.dat', blastpParams)
				expect(commandTwo).eql(expectedCommandTwo)
			})
		})
		describe('buildMakeDatabaseCommand', function() {
			it('should build a command using default params', function() {
				const expectedCommand = 'makeblastdb -in myFastaFile.fa -out mydb -dbtype prot'
				const commandsTk = new Blastinutils.CommandsToolKit()
				const command = commandsTk.buildMakeDatabaseCommand('myFastaFile.fa', 'mydb')
				expect(command).eql(expectedCommand)
			})
			it('should be able to change default commands during initialization', function() {
				const makeblastdbParams = [
					['dbtype', 'nucl']
				]
				const params = {
					makeblastdb: makeblastdbParams
				}
				const expectedCommandOne = 'makeblastdb -in myFastaFile.fa -out mydb -dbtype nucl'
				const commandsTk = new Blastinutils.CommandsToolKit(params)
				const commandOne = commandsTk.buildMakeDatabaseCommand('myFastaFile.fa', 'mydb')
				expect(commandOne).eql(expectedCommandOne)
				const expectedCommandTwo = 'makeblastdb -in myOtherFastaFile.fa -out myOtherDb -dbtype nucl'
				const commandTwo = commandsTk.buildMakeDatabaseCommand('myOtherFastaFile.fa', 'myOtherDb')
				expect(commandTwo).eql(expectedCommandTwo)
			})
			it('should be able to change default commands during function call', function() {
				const makeblastdbParams = [
					['dbtype', 'nucl']
				]
				const expectedCommandOne = 'makeblastdb -in myFastaFile.fa -out mydb -dbtype prot'
				const commandsTk = new Blastinutils.CommandsToolKit()
				const commandOne = commandsTk.buildMakeDatabaseCommand('myFastaFile.fa', 'mydb')
				expect(commandOne).eql(expectedCommandOne)
				const expectedCommandTwo = 'makeblastdb -in myOtherFastaFile.fa -out myOtherDb -dbtype nucl'
				const commandTwo = commandsTk.buildMakeDatabaseCommand('myOtherFastaFile.fa', 'myOtherDb', makeblastdbParams)
				expect(commandTwo).eql(expectedCommandTwo)
			})
		})
	})
	describe('Parser', function() {
		describe('parseTabularData', function() {
			it('should parse complete line', function() {
				const line = 'Ps_aer|GCF_000006765.1-PA0973	Al_ill|GCF_000619845.1-Q337_RS0100765	130	51.471	9.05e-42	168	136'
				const parser = new Blastinutils.Parser()
				const parsedLine = parser.parseTabularData(line)
				const expectedParsedLine = {
					qseqid: 'Ps_aer|GCF_000006765.1-PA0973',
					sseqid: 'Al_ill|GCF_000619845.1-Q337_RS0100765',
					bitscore: 130,
					pident: 51.471,
					evalue: 9.05e-42,
					qlen: 168,
					length: 136
				}
				expect(parsedLine).eql(expectedParsedLine)
			})
			it('should return incomplete line', function() {
				const line = 'Ps_aer|GCF_000006765.1-PA0973	Al_ill|GCF_000619845.1-Q337_RS0100765	130	51.471	9.05e-42'
				const parser = new Blastinutils.Parser()
				const parsedLine = parser.parseTabularData(line)
				const expectedParsedLine = line
				expect(parsedLine).eql(expectedParsedLine)
			})
		})
	})
	describe('NodesAndLinksStream', function() {
		it('should parse the data', function() {
			const blastResultsStream = fs.createReadStream('test-data/tabularBlastResults.dat')
			const expectedNodes = [
				'Ps_aer|GCF_000006765.1-PA0685',
				'Ps_aer|GCF_000006765.1-PA1868',
				'Ps_aer|GCF_000006765.1-PA3105',
				'Mu_mur|GCF_001038205.1-RO21_RS00750',
				'Ps_aer|GCF_000006765.1-PA1382',
				'Ps_aer|GCF_000006765.1-PA1716',
				'Ps_aer|GCF_000006765.1-PA2633'
			]
			const expectedLinks = [
				{
					s: 0,
					t: 0,
					e: 200
				},
				{
					s: 0,
					t: 1,
					e: 84.44
				},
				{
					s: 0,
					t: 2,
					e: 51.09
				},
				{
					s: 0,
					t: 3,
					e: 25.01
				},
				{
					s: 4,
					t: 0,
					e: 25.04
				},
				{
					s: 5,
					t: 5,
					e: 200
				},
				{
					s: 1,
					t: 6,
					e: 0.29
				},
				{
					s: 2,
					t: 4,
					e: 2.3
				},
			]
			const nodesNlinksStream = new Blastinutils.NodesAndLinksStream()
			blastResultsStream
				.pipe(nodesNlinksStream)
				.on('finish',() => {
					expect(nodesNlinksStream.nodes).eql(expectedNodes)
					expect(nodesNlinksStream.links).eql(expectedLinks)
				})
			

		})
	})
})
