# Změny:

### Profil:

- [x] vytvoření profilu
- [ ] úprava profilu (adminem)

### Availability:

- [ ] vytváření availability
- [ ] response byly nastaveny ku jednotlivým lidem, kontrola zda Praha nezadává availability pro Brno.
- [ ] v případě že uživatel má vícero center, ukázat jaká availability je pro jaké centrum.
- [ ] Date lock fix

### Location:
- [ ] atribut při vytváření, rozdělení na ty podsekce, filtry?

### Exams:
- [ ] vytváření nové exam má atribut centre (automaticky předvyplněný)
- [ ] alokace lidí na základě jejich profilu


### --- RUN THE PROJECT ---
- Clone the repository - back-end and front-end
- Install the dependencies

Quasar build

sudo cp -r dist/spa/* /var/www/html/

sudo chown -R www-data:www-data /var/www/html/

sudo chmod -R 755 /var/www/html/

sudo systemctl restart nginx

194.182.77.166
