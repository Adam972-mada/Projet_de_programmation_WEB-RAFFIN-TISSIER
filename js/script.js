const carte = d3.select("#carte");

// Ce fichier est aussi utilisable sur les pages des continents.
if (!carte.empty()) {
    const largeur = 1100;
    const hauteur = 580;

    const noms = {
        "Africa": "Afrique",
        "Asia": "Asie",
        "Europe": "Europe",
        "North America": "Amérique du Nord",
        "South America": "Amérique du Sud",
        "Oceania": "Océanie",
        
    };

    const pages = {
        "Afrique": "afrique.html",
        "Asie": "asie.html",
        "Europe": "europe.html",
        "Amérique du Nord": "amerique_nord.html",
        "Amérique du Sud": "amerique_sud.html",
        "Océanie": "oceanie.html"
    };

    const svg = carte.append("svg")
        .attr("viewBox", `0 0 ${largeur} ${hauteur}`)
        .attr("role", "img")
        .attr("aria-label", "Carte interactive des continents");

    const projection = d3.geoNaturalEarth1()
        .fitExtent([[25, 25], [largeur - 25, hauteur - 25]], { type: "Sphere" });
    const chemin = d3.geoPath(projection);
    const groupe = svg.append("g");
    const instruction = document.getElementById("instruction");
    const chargement = document.getElementById("chargement");

    function obtenirNom(d) {
        const p = d.properties || {};
        const original = p.CONTINENT || p.continent || p.name || p.NAME || p.NAME_EN || "";
        return noms[original] || original;
    }

    function ouvrirContinent(element, d) {
        const nom = obtenirNom(d);
        const page = pages[nom];
        if (!page) {
            console.warn("Continent sans page :", nom);
            return;
        }

        groupe.selectAll(".continent").style("pointer-events", "none");
        d3.select(element).classed("selectionne", true).raise();

        const limites = chemin.bounds(d);
        let centreX = (limites[0][0] + limites[1][0]) / 2;
        let centreY = (limites[0][1] + limites[1][1]) / 2;
        const tailleX = limites[1][0] - limites[0][0];
        const tailleY = limites[1][1] - limites[0][1];
        let zoom = Math.min(4, 0.8 * Math.min(largeur / tailleX, hauteur / tailleY));

        if (nom === "Asie" || nom === "Océanie") {
            zoom = nom === "Asie" ? 2 : 3;
            [centreX, centreY] = chemin.centroid(d);
        }

        groupe.transition()
            .duration(1100)
            .ease(d3.easeCubicInOut)
            .attr("transform", `translate(${largeur / 2}, ${hauteur / 2}) scale(${zoom}) translate(${-centreX}, ${-centreY})`)
            .on("end", function() {
                window.location.href = page;
            });
    }

    d3.json("https://raw.githubusercontent.com/xoolive/topojson/master/world-continents.json")
        .then(function(donnees) {
            const objet = Object.values(donnees.objects)[0];
            const continents = topojson.feature(donnees, objet).features;
            if (chargement) chargement.remove();

            groupe.selectAll("path")
                .data(continents.filter(d => Boolean(pages[obtenirNom(d)])))
                .join("path")
                .attr("class", "continent")
                .attr("d", chemin)
                .attr("tabindex", 0)
                .attr("role", "link")
                .attr("aria-label", d => obtenirNom(d))
                .on("mouseover", function(event, d) {
                    if (instruction) instruction.textContent = obtenirNom(d);
                })
                .on("mouseout", function() {
                    if (instruction) instruction.textContent = "Sélectionnez un continent pour commencer votre voyage";
                })
                .on("click", function(event, d) {
                    ouvrirContinent(this, d);
                })
                .on("keydown", function(event, d) {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        ouvrirContinent(this, d);
                    }
                });
        })
        .catch(function(erreur) {
            console.error("Erreur de chargement de la carte :", erreur);
            if (chargement) chargement.textContent = "Impossible de charger la carte. Vérifiez votre connexion Internet.";
        });
}
