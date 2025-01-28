# Změny:

### Profil:

- [x] vytvoření profilu
- [ ] úprava profilu (adminem)
- [x] zobrazení center na profilu

### Availability:

- [x] vytváření availability
- [x] rozdělení na jednotlivé centra
- [x] v případě že uživatel má vícero center, ukázat jaká availability je pro jaké centrum.
- [x] Date lock fix

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
