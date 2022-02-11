const csv = require('csv-parser')
const fs = require('fs')

const results = []
const election = 2017
const tour = 2
const candidats = ['Marine LE PEN (RN)', 'Emmanuel MACRON (LREM)']

const file = `${election} T${tour}`

function csvToJson() {

	fs.createReadStream(`./Elections/${file}/${file}.csv`)
		.pipe(csv({ separator: ';' }))
		.on('data', (data) => results.push(data))
		.on('end', () => {
			let final = []
			results.forEach((el) => {
				console.log(el)

				let document = {
					election: election,
					tour: tour,
					code: el['Code du département'],
					libelle: el['Libellé du département'],
					inscrits: Number(el.Inscrits),
					votants: Number(el.Votants),
					exprimes: Number(el['Exprimés']),
					abstentions: Number(el.Abstentions),
					blancs_nuls: Number(el['Blancs et nuls']),
				}

				const output = []
				candidats.forEach((el2) => {
					const nom = el2.split('(')[0]
					const parti = el2.split('(')[1].slice(0, -1)
					const candidat = {
						nom: nom,
						parti: parti,
						votes: Number(el[el2]),
					}
					output.push(candidat)
				})

				document.candidats = output

				final.push(document)
			})

			if (fs.existsSync(`./Elections/${file}/${file}.json`) === true) {
				fs.rmSync(`./Elections/${file}/${file}.json`)
			}

			fs.writeFileSync(
				`./Elections/${file}/${file}.json`,
				JSON.stringify(final, null, 2)
			)
		})
}

function removeSpaces() {
	const json = JSON.parse(fs.readFileSync(`./Elections/${file}/${file}.json`))

	json.forEach((el) => {
		el.candidats.forEach((el2) => {
			el2.nom = el2.nom.slice(0, -1)
		})
	})

	if (fs.existsSync(`./Elections/${file}/${file}.json`) === true) {
		fs.rmSync(`./Elections/${file}/${file}.json`)
	}

	fs.writeFileSync(
		`./Elections/${file}/${file}.json`,
		JSON.stringify(json, null, 2)
	)
}

function createOpenSearchJson() {
	const json = JSON.parse(
		fs.readFileSync('./Elections/Présidentielles 1965-2017.json')
	)
	let opensearch = ''

	json.forEach((el, index) => {
		console.log(el)
		opensearch = `${opensearch}{"index":{"_index": "presidentielles", "_id":${
			index + 1
		}}}\n${JSON.stringify(el)}\n`
	})

	if (
		fs.existsSync('./Elections/OpenSearch/results_elections_1965_2017.json') ===
    true
	) {
		fs.rmSync('./Elections/OpenSearch/results_elections_1965_2017.json')
	}

	fs.writeFileSync(
		'./Elections/OpenSearch/results_elections_1965_2017.json',
		opensearch
	)
}

for (let i = 0; i < process.argv.length; i++) {
	switch (process.argv[i]) {
	case 'csv-to-json':
		csvToJson()
		break
	case 'remove-spaces':
		removeSpaces()
		break
	case 'create-opensearch-json':
		createOpenSearchJson()
		break
	}
}

module.exports.csvToJson = csvToJson
module.exports.removeSpaces = removeSpaces
module.exports.createOpenSearchJson = createOpenSearchJson
