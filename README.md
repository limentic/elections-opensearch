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

## Sources :
Ce dataset à été constitué par moi même ([limentic](https://github.com/limentic)), grace à ces différentes sources :

---

https://www.data.gouv.fr/fr/pages/donnees-des-elections/

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