'use strict'

const expect = require('chai').expect

const Blastinutils = require('./Blastinutils')

const kDefaults = {
	numBlastThreads: 4,
	outputFormat: '"6 qseqid sseqid bitscore pident evalue qlen length"',
	maxEvalue: 1,
	maxTargetSeqs: 1000
}

describe('Blastinutils', function() {
	describe('setNewParams and getParams', function() {
		it('should change params', function() {
			const newParams = {
				not: 'a good param'
			}
			const blastinutils = new Blastinutils()
			const defaultParams = blastinutils.getParams()
			blastinutils.setNewParams(newParams)
			expect(blastinutils.getParams()).to.be.not.eql(defaultParams)
			expect(blastinutils.getParams()).to.be.eql(newParams)
		})
	})
	describe('buildBlastpCommand', function() {
		it('should build a command using default params', function() {
			const expectedCommand = 'blastp -db mydb -query myquery -out myoutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1 -max_target_seqs 1000'
			const blastinutils = new Blastinutils()
			const command = blastinutils.buildBlastpCommand('mydb', 'myquery', 'myoutputFile.dat')
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
			const blastinutils = new Blastinutils(params)
			const commandOne = blastinutils.buildBlastpCommand('mydb', 'myquery', 'myoutputFile.dat')
			expect(commandOne).eql(expectedCommandOne)
			const expectedCommandTwo = 'blastp -db myOtherDb -query myOtherQuery -out myOtherOutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1e-10 -max_target_seqs 1001'
			const commandTwo = blastinutils.buildBlastpCommand('myOtherDb', 'myOtherQuery', 'myOtherOutputFile.dat')
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
			const blastinutils = new Blastinutils()
			const commandOne = blastinutils.buildBlastpCommand('mydb', 'myquery', 'myoutputFile.dat')
			expect(commandOne).eql(expectedCommandOne)
			const expectedCommandTwo = 'blastp -db myOtherDb -query myOtherQuery -out myOtherOutputFile.dat -num_threads 4 -outfmt "6 qseqid sseqid bitscore pident evalue qlen length" -evalue 1e-10 -max_target_seqs 1001'
			const commandTwo = blastinutils.buildBlastpCommand('myOtherDb', 'myOtherQuery', 'myOtherOutputFile.dat', blastpParams)
			expect(commandTwo).eql(expectedCommandTwo)
		})
	})
	describe('buildMakeDatabaseCommand', function() {
		it('should build a command using default params', function() {
			const expectedCommand = 'makeblastdb -in myFastaFile.fa -out mydb -dbtype prot'
			const blastinutils = new Blastinutils()
			const command = blastinutils.buildMakeDatabaseCommand('myFastaFile.fa', 'mydb')
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
			const blastinutils = new Blastinutils(params)
			const commandOne = blastinutils.buildMakeDatabaseCommand('myFastaFile.fa', 'mydb')
			expect(commandOne).eql(expectedCommandOne)
			const expectedCommandTwo = 'makeblastdb -in myOtherFastaFile.fa -out myOtherDb -dbtype nucl'
			const commandTwo = blastinutils.buildMakeDatabaseCommand('myOtherFastaFile.fa', 'myOtherDb')
			expect(commandTwo).eql(expectedCommandTwo)
		})
		it('should be able to change default commands during function call', function() {
			const makeblastdbParams = [
				['dbtype', 'nucl']
			]
			const expectedCommandOne = 'makeblastdb -in myFastaFile.fa -out mydb -dbtype prot'
			const blastinutils = new Blastinutils()
			const commandOne = blastinutils.buildMakeDatabaseCommand('myFastaFile.fa', 'mydb')
			expect(commandOne).eql(expectedCommandOne)
			const expectedCommandTwo = 'makeblastdb -in myOtherFastaFile.fa -out myOtherDb -dbtype nucl'
			const commandTwo = blastinutils.buildMakeDatabaseCommand('myOtherFastaFile.fa', 'myOtherDb', makeblastdbParams)
			expect(commandTwo).eql(expectedCommandTwo)
		})
	})
	describe('parseTabularData', function() {
		it.only('should parse complete line', function() {
			const line = 'Ps_aer|GCF_000006765.1-PA0973	Al_ill|GCF_000619845.1-Q337_RS0100765	130	51.471	9.05e-42	168	136'
			const blastinutils = new Blastinutils()
			const parsedLine = blastinutils.parseTabularData(line)
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
		it.only('should return incomplete line', function() {
			const line = 'Ps_aer|GCF_000006765.1-PA0973	Al_ill|GCF_000619845.1-Q337_RS0100765	130	51.471	9.05e-42'
			const blastinutils = new Blastinutils()
			const parsedLine = blastinutils.parseTabularData(line)
			const expectedParsedLine = line
			expect(parsedLine).eql(expectedParsedLine)
		})
	})
})
