# mamazee

TODO engine speed control

## algoritmi 1

lähtöpisteestä alkaen täytä ruutua siten että

- tee reittiä: arvo satunnaisesti suunta, ruuduista, joissa ei ole jo reittiä
- jos umpikuja, etsi paikka, johon voi tehdä risteyksen joko
  'end' - uusimmasta reitistä
  'start' - vanhimmasta reitistä
- tee risteys ja aloita siitä uusi reitti

## ajatuksia

        keskipiste
        maalipiste
        tee yksi reitti maaliin
        - satunnainen reitti, laske pituus
        joka 20s askel, painota kohti lähtöä
        jos ei pääse eteenpäin
        laske lähimpänä maalia oleva piste, tee siihen risteys
        jatka siitä

        start -metodi
        heitä risteykset jonoon, jos et pysty etsimään uutta risteystä tästä reitistä
        vaihda reitinetsintä jatkumaan risteyksistä

        pidä kirjaa edellisestä suunnasta, maalin suunnasta
        jos ympärillä on seinät, osaa mennä eteenpäin
        Jos yhdellä puolella on seinä, osaa mennä eteenpäin tai kääntyä

        pidä kirjaa ruuduista, jotka on täytetty
        jos ruutua ei ole täytetty, ja ollaan maalissa, tee risteys

        1 = jako
        joka 100:s, jako
        5:n jälkeen painota mutkaa



# dev

https://www.snowpack.dev/tutorials/getting-started

snopacking cahchessa jotain mätää

 "start": "snowpack dev --reload",