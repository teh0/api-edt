# api-edt

La plateforme actuelle pour consulter l'emploi du temps de l'IUT de Chambéry est peu UX et pas très agréable à utiliser sur téléphone. Dans le cadre d'un projet de semestre 4, nous devions créer une application mobile. Nous nous sommes servis de ce projet pour réaliser une application mobile d'emploi du temps. 

Mon rôle dans ce projet à été de construire **une API REST** permettant au front de récupérer toutes les données d'emploi du temps en fonction des utilisateurs.
Pour cela, j'ai utilisé **NodeJS**

## Problématiques du projet
* *Une documentation plus technique arrivera très prochainement mais je tenais quand même à vous expliquer comment cela fonctionne dans les grandes lignes.* *

- **Comment récupérer les données d'un serveur existant ?**

  J'ai beaucoup réfléchi à cette problématique car c'était le problème majeur de l'API. Les données d'emploi du temps sont stockées sur le serveur [ADE](https://ade6-usmb-ro.grenet.fr/direct/index.jsp?data=bd72d825015315fe400a2e8897636a690412158042ec7880df46b7c8db8028847a856464e9e1a5bac86f839c03d7c55aedc5434d4a4b357ad7a78c3eabf336a2d756ba483954b0e3edf59b9627563685) qui est un service d'emploi du temps pour les universités.
  
  Le seul moyen de pouvoir les récupérer est de télécharger un fichier ICS **manuellement** en précisant la période souhaitée ainsi que la formation. On pouvait donc cibler la formation souhaitée en modifiant un paramètre de l'URL de téléchargement du fichier ICS.
  Voici à quoi ressemble l'url de téléchargement :
  ```
  http://ade6-usmb-ro.grenet.fr/jsp/custom/modules/plannings/direct_cal.jsp?resources=3211,3209,3208,3207,3206,3205,3204,2150&projectId=5&calType=ical&login=iCalExport&password=73rosav&lastDate=2030-08-14
  ```
  Le paramètre intéressant est ```ressource```. Il correspond à un groupe d'utilisateurs précis (TP1 de la promo des MMI2 par exemple).
  C'est donc ce paramètre que l'on va pouvoir dynamiser pour récupérer les bonnes données d'emploi du temps, avec une **requête Ajax par exemple**.
  
- **Comment exploiter les données d'un fichier ICS ?**

  Lorsque l'on récupère les données d'un fichier ```.ics```, elles sont converties en ```string```. Ce type de variable n'est pas très pratique pour le traitement de données en Javascript.
  Le seul moyen de l'exploiter était de convertir le contenu en **format JSON**. 
  Sur NPM, une librairie qui s'appelle [node-ical](https://www.npmjs.com/package/node-ical) est capable de convertir des données ics en JSON. Il suffit de l'importer dans son fichier javascript et on peut facilement traiter les données. 
  ```js
  const ical = require('node-ical');
  
  ical.fromURL(url, {}, function(err, data) {
    /*data in JSON format*/
  });
  ```
  Ce qui est pratique avec cette librairie, c'est qu'il n'est plus nécessaire de récupérer les données une première fois en Ajax avant de pouvoir les traiter. Avec la  variable ```url``` passée en paramètre, la librairie se charge directement de faire la récupération des données puis de les **convertir en format JSON**.
  
- **Comment dynamiser les URL ?**

  Pour cela, [Express](http://expressjs.com/) m'a été très utile. Grâce à ce module, on peut facilement gérer les requêtes et les réponses HTTP.
  En fonction des paramètres de la requête, on peut facilement, renvoyer une réponse dynamique.
  
## Détails techniques du projets ##

Chaque étudiant de l'IUT est caractérisé par un type d'IUT (MMI, GACO, PEC ...) et un groupe (TP1, TD2 ...).
Si l'application a besoin de retourner les horaires d'un étudiant qui est en MMI1 dans le tp12, alors elle enverra à l'API la requête suivante : 

```
https://api-edt/edt?group=mmi1tp12&iut=mmi
```
On remarque que la requête comprend 2 paramètres : ```iut``` et ```group```
Pour le moment, le paramètre ```iut``` ne prend qu'une seule valeur (**mmi**) car nous voulons dans un premier temps rendre fonctionnel notre application sur une seule formation. Le paramètre ```group``` lui en revanche possède plusieurs valeurs possibles :

| Valeurs du paramètre ```**group**``` |
| :---        |
| mmi1promo   |
| mmi1td1     |
| mmi1td2     |
| mmi1tp11    |
| mmi1tp12    |
| mmi1tp21    |
| mmi1tp22    |
| mmi2promo   |
| mmi2td1     |
| mmi2td2     |
| mmi2tp11    |
| mmi2tp12    |
| mmi2tp21    |
| mmi2tp22    |
| s4com       |
| s4graph     |
| s4av        |
| s4info      |
  
Rappelez vous tout au début du paramètre ```ressource``` de l'url de téléchargement du fichier ICS. 
Chaque groupe est associé à une ID unique permettant à ADE de télécharger le bon fichier ICS. C'est pourquoi j'ai créé un fichier ```request.json``` qui associe à chaque groupe l'ID associée.
```json
{
  "group": "mmi1promo",
  "ressource": "3204"
},
{
  ...
},
...
```

Maintenant que nous avons les groupes associés aux ID, il nous suffit de faire des conditions sur les paramètres envoyés à l'API et en fonction, on ira faire une requête Ajax sur l'url ADE correspondante : 

**Un scénario pour mieux comprendre**
* *Pour simplifier la syntaxe, je remplacerai 
```
http://ade6-usmb-ro.grenet.fr/jsp/custom/modules/plannings/direct_cal.jsp?resources=3211,3209,3208,3207,3206,3205,3204,2150&projectId=5&calType=ical&login=iCalExport&password=73rosav&lastDate=2030-08-14
```
par
```
http://ade.fr/resources=xxx
```

Supposons que je sois un étudiant de première année en MMI, dans le TP 1.2. Au moment où je vais cliquer sur "afficher mon emploi du temps", l'application envoie la requête ```https://api-edt/edt?group=mmi1tp12&iut=mmi``` à l'API. 

Elle va donc récupérer le paramètre ```group``` et va l'associer à la bonne ID de la ressource (grâce au fameux fichier ```request.json```) en la stockant dans une variable ``` ressource```.

Ensuite, on dynamise l'url de la requête comme ceci : 
```js 
const url = `http://ade.fr/resources=${ressource}`; 
```
Enfin, on n'a plus qu'à passer la variable ```url``` au module node-ical. Ce dernier se chargera de convertir les données au format JSON et de les renvoyer au Front.
```js 
ical.fromURL(url, {}, function(err, data) {
  /*JSON data*/
});
```

Avant de les renvoyer au Front, j'effectue quand même quelques traitements sur les données JSON pour rajouter une propriété couleur afin d'associer une matière à une couleur par exemple. 

**Test et utilisation**
Avant de pouvoir tester le projet, il faut vous assurer que [NodeJS](https://nodejs.org/en/) soit bien installé sur votre machine.

**Pour tester le projet, il vous suffit de suivre les étapes suivantes**

- Clonez ou téléchargez le projet 
- Ouvrez une ligne de commande et ciblez le repertoire dans lequel ce trouve votre projet
- Lancez le serveur avec la ligne de commande 
```console
node server.js
```

Votre serveur est maintenant lancé. L'adresse du serveur node est la suivante : ```http://localhost:1337```
Vous pouvez d'ailleurs tester si cela fonctionne en tapant sur votre navigateur ```http://localhost:1337/edt?group=s4info&iut=mmi```

**Parfois**, il arrive que votre navigateur renvoie un message d'erreur quand vous effectuez une requête Ajax sur l'adresse du serveur js
```
XMLHttpRequest cannot load http://localhost:1337
Origin [my_domain] is not allowed by Access-Control-Allow-Origin.
```

Dans ce cas las, il suffit simplement de remplacer **http://localhost:1337** par **[votre adresse IP]:1337**
