# api-edt

La plateforme actuelle pour consulter l'emploi du temps de notre IUT est très peu UX et pas très agréable à utiliser sur téléphone. Dans le cadre d'un projet de semestre 4, nous devions créer une application mobile. Nous nous sommes servis de ce projet pour réaliser une application mobile d'emploi du temps. 

Mon rôle dans ce projet à été de construire **une API REST** permettant aux front de récupérer toutes les données d'emploi du temps en fonction des utilisateurs.
Pour cela, j'ai utilisé **NodeJS**

## Fonctionnement du projet
Une documentation plus technique arrivera très prochainement mais je tenais quand même à vous expliquer comment cela fonctionne dans les grandes lignes.

- Comment récupérer les données d'un serveur existant ?
  J'ai beaucoup réfléchie à cette problématique car c'était le problème majeur de l'API. Les données d'emploi du temps sont stockées sur le serveur [ADE](https://ade6-usmb-ro.grenet.fr/direct/index.jsp?data=bd72d825015315fe400a2e8897636a690412158042ec7880df46b7c8db8028847a856464e9e1a5bac86f839c03d7c55aedc5434d4a4b357ad7a78c3eabf336a2d756ba483954b0e3edf59b9627563685) qui est un service d'emploi du temps pour les universités.
  
  Le seul moyen de pouvoir les récupéreer était de télécharger un fichier ICS manuellement en précisant la période souhaitée ainsi que la formation. On pouvait donc cilber la formation en modifiant un paramètre de l'URL de téléchargement du fichier ICS.
  Avec une requête ajax sur cette url, je pouvait donc récupérer dans une variable les données d'emploi du temps !
  
  - Comment exploiter les données d'un fichier ICS ?
  
