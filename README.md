# TP OpenSearch

## Introduction :
Ce dataset contient les résultats des élections présidentielles en France Métropolitaine, par département, de 1965 à 2017.

Voici à quoi ressemble le document *elections*.
``` JSON
{
    "election": 1965,
    "tour": 1,
    "code": "1",
    "libelle": "AIN",
    "inscrits": 206496,
    "votants": 166986,
    "exprimes": 165555,
    "abstentions": 39510,
    "blancs_nuls": 1431,
    "candidats": [
      {
        "nom": "François MITTERRAND",
        "parti": "CIR",
        "votes": 50418
      },
      {
        "nom": "Charles DE GAULLE",
        "parti": "UNR",
        "votes": 71246
      },
      {
        "nom": "Jean LECANUET",
        "parti": "MRP",
        "votes": 30416
      },
      {
        "nom": "Jean-Louis TIXIER-VIGNANCOUR",
        "parti": "EXD",
        "votes": 8317
      },
      {
        "nom": "Pierre MARCILHACY",
        "parti": "DVD",
        "votes": 3006
      },
      {
        "nom": "Marcel BARBU",
        "parti": "DIV",
        "votes": 2152
      }
    ]
  }
```
Comme vous pouvez le constater, nous avons des chiffres globaux sur les voix (Inscrits, Votants, Abstentions, etc...) mais également le détail par candidats.

## Création du dataset :
Pour produire un dataset importable dans OpenSearch, j'ai utilisé NodeJS pour la génération des JSON et Excel pour tout ce qui est restructuration des données sources.

Vous pourrez retrouver le code source qui m'a permis de générer ces fichiers sur ce repo.

## Import du dataset :
Avant tout, pour continuer il vous faudra un moyen de construire des requetes REST.
Je vous conseille l'utilisation de cURL ou de Insomnia.

Pour commencer, il faut d'abord créer un index :
```bash
curl -u admin:admin --insecure -XPUT "https://localhost:9200/presidentielles?pretty"
```

Ensuite, il faut "mapper" les données, afin qu'OpenSearch fonctionne :
```bash
curl -u admin:admin --insecure -XPUT "https://localhost:9200/presidentielles/_mapping?pretty" -H 'Content-Type: application/json' -d @mapping_elections_1965_2017.json
```

Enfin nous pouvons importer les données :
```bash
curl -u admin:admin --insecure -XPUT https://localhost:9200/_bulk -H "Content-Type: application/json" --data-binary @results_elections_1965_2017.json
```

## Reqûetes & Aggrégations:

1) Pour l'année 1965, quel département à eu le plus d'abstentionnistes ?

```json
// URL - https://localhost:9200/presidentielles/_search?size=1

// Input
{
	"query": {
		"term": {
			"election": 1965
		}
	},
	"sort": [{"abstentions": "desc"}]
}

// Output :
{
	"took": 6,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 180,
			"relation": "eq"
		},
		"max_score": null,
		"hits": [
			{
				"_index": "presidentielles",
				"_type": "_doc",
				"_id": "165",
				"_score": null,
				"_source": {
					"election": 1965,
					"tour": 2,
					"code": "75",
					"libelle": "SEINE",
					"inscrits": 3218731,
					"votants": 2716430,
					"exprimes": 2639147,
					"abstentions": 502301,
					"blancs_nuls": 77283,
					"candidats": [
						{
							"nom": "François MITTERRAND",
							"parti": "CIR",
							"votes": 1253300
						},
						{
							"nom": "Charles DE GAULLE",
							"parti": "UNR",
							"votes": 1385847
						}
					]
				},
				"sort": [
					502301
				]
			}
		]
	}
}
```

2) Combien de votes blancs et nuls, on été comptabilsés en 1974 ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input
{
	"size": 0,
	"query": {
		"term": {
				"election": 1974
			}
	},
	"aggs": {
		"somme_blancs_nuls": {
			"sum": {
				"field": "blancs_nuls"
			}
		}
	}
}

// Output
{
	"took": 9,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 190,
			"relation": "eq"
		},
		"max_score": null,
		"hits": [
		]
	},
	"aggregations": {
		"somme_blancs_nuls": {
			"value": 576122.0
		}
	}
}
```

3) Qui à été élu dans le 79, au deuxième tour, en 1988.

```json
// URL - https://localhost:9200/presidentielles/_search

// Input
{
	"size": 1,
	"query": {
		"bool": {
			"should": [
				{
					"term": {
						"election": 1988
					}
				},
				{
					"term": {
						"tour": 2
					}
				},
				{
					"term": {
						"code": "79"
					}
				}
			]
		}
	}
}

// Output
{
	"took": 3,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 1057,
			"relation": "eq"
		},
		"max_score": 6.531812,
		"hits": [
			{
				"_index": "presidentielles",
				"_type": "_doc",
				"_id": "926",
				"_score": 6.531812,
				"_source": {
					"election": 1988,
					"tour": 2,
					"code": "79",
					"libelle": "DEUX-SEVRES",
					"inscrits": 250082,
					"votants": 216436,
					"exprimes": 208701,
					"abstentions": 33646,
					"blancs_nuls": 7735,
					"candidats": [
						{
							"nom": "François MITTERRAND",
							"parti": "PS",
							"votes": 112010
						},
						{
							"nom": "Jacques CHIRAC",
							"parti": "RPR",
							"votes": 96691
						}
					]
				}
			}
		]
	}
}
```

4) En quelle année y'a t'il eu le plus d'abstentions ?

```json
/* Pour cette question et celle d'après j'ai temporairement modifié le mapping pour le champ, election. Il est passé de integer à date. */

// URL - https://localhost:9200/presidentielles/_search

// Input
{
  "size": 0,
  "aggs": {
    "logs_per_month": {
      "date_histogram": {
        "field": "election",
        "interval": "year"
      },
      "aggs": {
        "sumAbstentions": {
          "sum": {
            "field": "abstentions"
          }
        },
        "vote_bucket_sort": {
          "bucket_sort": {
            "sort": [
              {
                "sumAbstentions": {
                  "order": "desc"
                }
              }
            ],
            "size": 1
          }
        }
      }
    }
  }
}

// Output
{
	"took": 7,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 1904,
			"relation": "eq"
		},
		"max_score": null,
		"hits": [
		]
	},
	"aggregations": {
		"logs_per_month": {
			"buckets": [
				{
					"key_as_string": "2017-01-01T00:00:00.000Z",
					"key": 1483228800000,
					"doc_count": 192,
					"sumAbstentions": {
						"value": 1.9426725E7
					}
				}
			]
		}
	}
}
```

5) En quelle année y'a t'il eu le plus de votants ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input
{
  "size": 0,
  "aggs": {
    "logs_per_month": {
      "date_histogram": {
        "field": "election",
        "interval": "year"
      },
      "aggs": {
        "sumAbstentions": {
          "sum": {
            "field": "votants"
          }
        },
        "vote_bucket_sort": {
          "bucket_sort": {
            "sort": [
              {
                "sumAbstentions": {
                  "order": "desc"
                }
              }
            ],
            "size": 1
          }
        }
      }
    }
  }
}

// Output
{
	"took": 9,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 1904,
			"relation": "eq"
		},
		"max_score": null,
		"hits": [
		]
	},
	"aggregations": {
		"logs_per_month": {
			"buckets": [
				{
					"key_as_string": "2007-01-01T00:00:00.000Z",
					"key": 1167609600000,
					"doc_count": 192,
					"sumAbstentions": {
						"value": 7.1825472E7
					}
				}
			]
		}
	}
}
```

6) Quels candidats ce sont présentés plus de 2x ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input

// Output

```

7) Quel candidat à été élu en 1995 ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input

// Output

```

8) Combien y'a t'il eu de candidats LO (Lutte ouvrière) ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input

// Output

```

9) Quel parti s'est présenté le plus grand nombre de fois ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input

// Output

```

10) Qui est arrivé en 2e position lors du 1er tour de 2007 ?

```json
// URL - https://localhost:9200/presidentielles/_search

// Input

// Output

```

## Sources :
Ce dataset à été constitué par moi même ([limentic](https://github.com/limentic)), grace à ces différentes sources :

---

https://www.data.gouv.fr/fr/pages/donnees-des-elections/

Pour les data brutes, et spécifiquement :
  - Le Gouvernement français pour les élections de 2017
  - Science Po, pour les éléctions de 1965 à 2012

---

https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_1965
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_1969
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_1974
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_1981
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_1988
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_1995
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2002
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2007
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2012
https://fr.wikipedia.org/wiki/%C3%89lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2017

Les articles de Wikipedia, pour retrouver les partis politiques et les prénoms, des candidats, car absent des données fournies par Science Po.