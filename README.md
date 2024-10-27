# TODO:

# - [?] Posts
- fix download buttons
- filtering
- search
- pagination

- todo upload file from post screen


# - [?] Availability
- comments ?
- autolock

- zrušit maybe
- yes/no/am/pm
- note z profilu


# - [?] Profile
- edit profile
- change password
- deactivation/activation
- 2FA modification
- avatar upload

- levels
- multiple roles

# - [?] Exams
- [] exam creation
- [] exam edit
- [] exam delete
- [] exam validation
- [] exam candidates
- [] exam schedule
- [] exam files + upload

# - [!] Candidates

# - [?] Admin


# - [ ] Add a description of the project
# - [ ] Add a list of the technologies used
# - [ ] Add a list of the features


### --- RUN THE PROJECT ---
# - [ ] Clone the repository - back-end and front-end
# - [ ] Install the dependencies

Quasar build
sudo cp -r dist/spa/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo systemctl restart nginx
194.182.77.166
