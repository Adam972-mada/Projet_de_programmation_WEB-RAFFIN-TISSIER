const carte = d3.select("#carte");

const largeur = 1100;
const hauteur = 580;

// Création de notre carte SVG
const svg = carte.append("svg")
    .attr("viewBox", `0 0 ${largeur} ${hauteur}`)
    .attr("role", "img")
    .attr("aria-label", "Carte interactive des continents");

// Projection géographique du monde
const projection = d3.geoNaturalEarth1()
    .fitExtent(
        [[25, 25], [largeur - 25, hauteur - 25]],
        { type: "Sphere" }
    );

// Transforme les coordonnées en formes SVG
const chemin = d3.geoPath(projection);

// Groupe qui contiendra les continents
const groupe = svg.append("g");

// Noms des continents
const noms = {
    "Africa": "Afrique",
    "Asia": "Asie",
    "Europe": "Europe",
    "North America": "Amérique",
    "South America": "Amérique",
    "America": "Amérique",
    "Oceania": "Océanie",
    "Australia": "Océanie",
    "Antarctica": "Antarctique"
};

// Fonction pour créer une adresse de page
function creerAdresse(nom) {
    return nom
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ /g, "-");
}

// Récupérer le nom du continent
function obtenirNom(d) {
    const proprietes = d.properties || {};

    const nom =
        proprietes.CONTINENT ||
        proprietes.continent ||
        proprietes.name ||
        proprietes.NAME ||
        "Continent";

    return noms[nom] || nom;
}

// Chargement des contours des continents
d3.json(
    "https://raw.githubusercontent.com/xoolive/topojson/master/world-continents.json"
)
.then(function(donnees) {

    const chargement = document.getElementById("chargement");
    if (chargement) chargement.remove();

    const objet = Object.values(donnees.objects)[0];

    let continents = topojson.feature(
        donnees,
        objet
    ).features;

    // Regrouper l'Amérique du Nord et du Sud
    const ameriques = continents.filter(d =>
        obtenirNom(d) === "Amérique"
    );

    if (ameriques.length === 2) {

        const amerique = {
            type: "Feature",
            properties: {
                name: "America"
            },
            geometry: {
                type: "GeometryCollection",
                geometries: ameriques.map(d => d.geometry)
            }
        };

        continents = continents.filter(d =>
            !ameriques.includes(d)
        );

        continents.push(amerique);
    }

    // Dessiner les continents
    groupe.selectAll("path")
        .data(continents)
        .join("path")
        .attr("class", "continent")
        .attr("d", chemin)
        .attr("tabindex", 0)
        .attr("role", "link")
        .attr("aria-label", d => obtenirNom(d))

        .on("mouseover", function(event, d) {
            document.getElementById("instruction").textContent =
                obtenirNom(d);
        })

        .on("mouseout", function() {
            document.getElementById("instruction").textContent =
                "Sélectionnez un continent pour commencer votre voyage";
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

    console.error(erreur);

    const chargement = document.getElementById("chargement");

    if (chargement) {
        chargement.textContent =
            "Impossible de charger la carte. Vérifiez votre connexion Internet.";
    }
});

// Animation et ouverture de la page
function ouvrirContinent(element, d) {

    const nom = obtenirNom(d);
    const adresse = creerAdresse(nom);

    // Désactiver les clics pendant l'animation
    d3.selectAll(".continent")
        .style("pointer-events", "none");

    // Sélectionner le continent
    d3.select(element)
        .classed("selectionne", true)
        .raise();

    // Calculer les limites du continent
    const limites = chemin.bounds(d);

    let centreX = (limites[0][0] + limites[1][0]) / 2;
    let centreY = (limites[0][1] + limites[1][1]) / 2;

    const tailleX = limites[1][0] - limites[0][0];
    const tailleY = limites[1][1] - limites[0][1];

    let zoom = Math.min(
        4,
        0.8 * Math.min(
            largeur / tailleX,
            hauteur / tailleY
        )
    );

    // Ajustement du zoom pour l'Asie
    if (nom === "Asie") {
        zoom = 2;
        centreX = chemin.centroid(d)[0];
        centreY = chemin.centroid(d)[1];
    }

    // Ajustement du zoom pour l'Océanie
    if (nom === "Océanie") {
        zoom = 3;
        centreX = chemin.centroid(d)[0];
        centreY = chemin.centroid(d)[1];
    }

    // Amérique du Nord et du Sud ensemble
    if (nom === "Amérique") {
        zoom = Math.min(
            4,
            0.8 * Math.min(
                largeur / tailleX,
                hauteur / tailleY
            )
        );
    }

    // Animation de zoom
    groupe.transition()
        .duration(1100)
        .ease(d3.easeCubicInOut)
        .attr(
            "transform",
            `translate(${largeur / 2}, ${hauteur / 2})
             scale(${zoom})
             translate(${-centreX}, ${-centreY})`
        )
        .on("end", function() {
            window.location.href =
                `continent.html?nom=${encodeURIComponent(adresse)}`;
        });
}