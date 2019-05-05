const ical = require('node-ical');
const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 1337;
//import filter for param request
const foo = fs.readFileSync('./request.json');
const param_url = JSON.parse(foo);

app.get('/edt', function (req, res) {
        var param = req.query; // On récupère tous les paramètres de la requète. Ex => ?iut=mmi&group=s4-info

        if (param.iut !== undefined && param.group !== undefined) { // si les paramètres sont renseignés
            var iut = param.iut; // On sélectionne iut du paramètre 
            var group = param.group; // On sélectionne group de paramètre
            var ressource;

            if (param_url[iut]) { // si le parametre iut correspond bien avec les données du request.json alors on continue sinon message erreur
                param_url[iut].forEach(element => {
                    if (element.group == group) {
                        ressource = element.ressource;
                    }
                });
                if (ressource !== undefined) {
                    const url = `http://ade6-usmb-ro.grenet.fr/jsp/custom/modules/plannings/direct_cal.jsp?resources=${ressource}&projectId=5&calType=ical&login=iCalExport&password=73rosav&lastDate=2030-03-13`;
                    ical.fromURL(url, {}, function(err, data) {
                        console.log(data);
                        const td = /TD\d*\n/;
                        const tp = /TP\d*\n/;
                        const cours = /Promo\n/;
                        const items = Object.values(data)
                          .filter(({type}) => type == 'VEVENT')
                          .map(({start, end, location, summary, description, uid}) => 
                          {
                            let item = 
                              ({key: uid, 
                                start, end, 
                                title: summary, 
                                summary: location + description.replace(/\n[^\n]*\n$/,''), 
                                location,
                              });
                            if (tp.test(description)) item.color='#FFFF7F';
                            if (td.test(description)) item.color='#7FFF7F';
                            if (cours.test(description)) item.color='#FF7F7F';
                            return item;
                          });
                          res.json(items);
                    });
                }
            }

        } else {
            res.json({
                message: "Error. Check your parameter. Read the doc : https://api_edt/doc if you have problems"
            })
        }
    })
    .listen(port, function () {
        console.log('Listening on http://localhost:' + port + '/edt');
    });
