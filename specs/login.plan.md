# Plan de test - Page de connexion Dolibarr

## Application Overview

La page de connexion de Dolibarr (htdocs/index.php) présente un formulaire d'authentification avec un champ identifiant (login ou email), un champ mot de passe, un bouton de connexion et optionnellement un lien "Mot de passe oublié". La sécurité inclut un jeton CSRF, une protection anti-force brute (délai de 1 s + comptage des tentatives échouées par IP), et un statut utilisateur actif obligatoire. L'application est accessible à http://localhost.

## Test Scenarios

### 1. Connexion réussie

**Seed:** `tests/seed.spec.ts`

#### 1.1. Connexion avec identifiant et mot de passe valides

**File:** `tests/login/login-success.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche avec le titre contenant 'Login'
    - expect: Le champ 'username' est visible et focalisé automatiquement
    - expect: Le champ 'password' est visible
    - expect: Le bouton 'Connection' est visible
  2. Saisir un identifiant valide (ex: admin) dans le champ 'username'
    - expect: La valeur saisie apparaît dans le champ
  3. Saisir le mot de passe correct dans le champ 'password'
    - expect: Le texte est masqué (type password)
  4. Cliquer sur le bouton 'Connection'
    - expect: L'utilisateur est redirigé vers le tableau de bord (home)
    - expect: Aucun message d'erreur n'est affiché
    - expect: La session est créée avec succès

#### 1.2. Connexion avec adresse email à la place du nom d'utilisateur

**File:** `tests/login/login-with-email.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir l'adresse email associée au compte (ex: admin@example.com) dans le champ 'username'
    - expect: La valeur saisie apparaît dans le champ
  3. Saisir le mot de passe correct dans le champ 'password'
  4. Cliquer sur le bouton 'Connection'
    - expect: L'utilisateur est redirigé vers le tableau de bord
    - expect: Aucun message d'erreur n'est affiché

#### 1.3. Connexion en soumettant le formulaire avec la touche Entrée

**File:** `tests/login/login-enter-key.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir un identifiant valide dans le champ 'username'
  3. Saisir le mot de passe correct dans le champ 'password'
  4. Appuyer sur la touche Entrée
    - expect: Le formulaire est soumis
    - expect: L'utilisateur est redirigé vers le tableau de bord

#### 1.4. Redirection vers la page d'origine après connexion (paramètre backtopage)

**File:** `tests/login/login-backtopage.spec.ts`

**Steps:**
  1. Naviguer vers une URL protégée qui déclenche une redirection vers la page de connexion avec le paramètre backtopage (ex: http://localhost/societe/index.php)
    - expect: La page de connexion s'affiche
    - expect: L'URL contient le paramètre backtopage
  2. Saisir un identifiant valide et le mot de passe correct
  3. Cliquer sur le bouton 'Connection'
    - expect: L'utilisateur est redirigé vers la page initialement demandée (societe/index.php) et non vers le tableau de bord par défaut

### 2. Échec de connexion - Identifiants incorrects

**Seed:** `tests/seed.spec.ts`

#### 2.1. Connexion avec un mot de passe incorrect

**File:** `tests/login/login-wrong-password.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir un identifiant valide dans le champ 'username'
  3. Saisir un mot de passe incorrect dans le champ 'password'
  4. Cliquer sur le bouton 'Connection'
    - expect: La page de connexion se réaffiche
    - expect: Un message d'erreur 'BadLoginPassword' (ou équivalent traduit) est visible
    - expect: L'utilisateur reste sur la page de connexion
    - expect: Le champ username est re-rempli avec la valeur précédente
    - expect: Le champ password est vide

#### 2.2. Connexion avec un identifiant inexistant

**File:** `tests/login/login-unknown-user.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir un identifiant inexistant (ex: utilisateur_inexistant_xyz) dans le champ 'username'
  3. Saisir n'importe quel mot de passe
  4. Cliquer sur le bouton 'Connection'
    - expect: La page de connexion se réaffiche
    - expect: Un message d'erreur identique à celui d'un mauvais mot de passe est affiché (pas de discrimination entre 'utilisateur inconnu' et 'mauvais mot de passe' pour des raisons de sécurité)

#### 2.3. Connexion avec les champs identifiant et mot de passe vides

**File:** `tests/login/login-empty-fields.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Ne rien saisir dans les champs 'username' et 'password'
  3. Cliquer sur le bouton 'Connection'
    - expect: La page de connexion se réaffiche ou un message de validation s'affiche
    - expect: Aucune redirection vers le tableau de bord ne se produit
    - expect: Un message d'erreur approprié est affiché

#### 2.4. Connexion avec uniquement l'identifiant renseigné (mot de passe vide)

**File:** `tests/login/login-no-password.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir un identifiant valide dans le champ 'username'
  3. Laisser le champ 'password' vide
  4. Cliquer sur le bouton 'Connection'
    - expect: La connexion échoue
    - expect: Un message d'erreur est affiché

#### 2.5. Connexion avec un compte utilisateur désactivé (statut = 0)

**File:** `tests/login/login-disabled-user.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir l'identifiant d'un compte désactivé
  3. Saisir le mot de passe correct du compte désactivé
  4. Cliquer sur le bouton 'Connection'
    - expect: La connexion échoue
    - expect: Un message d'erreur est affiché
    - expect: L'utilisateur reste sur la page de connexion

### 3. Protection et sécurité

**Seed:** `tests/seed.spec.ts`

#### 3.1. Protection anti-force brute après plusieurs tentatives échouées

**File:** `tests/login/login-brute-force.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Effectuer 5 tentatives de connexion consécutives avec un mauvais mot de passe pour le même compte
    - expect: Chaque tentative affiche le message d'erreur BadLoginPassword
    - expect: Un délai d'environ 1 seconde est observé entre la soumission et la réponse du serveur
  3. Après de très nombreuses tentatives échouées dépassant le seuil configuré (MAIN_SECURITY_MAX_NUMBER_FAILED_AUTH, défaut=100), tenter de se connecter à nouveau
    - expect: Un message 'ErrorTooManyAttempts' (ou équivalent traduit) s'affiche
    - expect: La connexion est bloquée même avec des identifiants corrects

#### 3.2. Vérification de la présence du jeton CSRF dans le formulaire

**File:** `tests/login/login-csrf-token.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Inspecter le code source du formulaire de connexion (id='login')
    - expect: Un champ caché 'token' est présent dans le formulaire
    - expect: La valeur du token est non vide
  3. Soumettre le formulaire manuellement (via un appel HTTP direct) sans le jeton CSRF valide
    - expect: La requête est rejetée avec une erreur de sécurité (CSRF)
    - expect: Aucune session utilisateur n'est créée

#### 3.3. Le mot de passe ne doit pas être visible en texte clair dans le DOM

**File:** `tests/login/login-password-hidden.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Vérifier l'attribut 'type' du champ de mot de passe dans le DOM
    - expect: L'attribut type est 'password' (pas 'text')
    - expect: La saisie est masquée visuellement
  3. Saisir un mot de passe dans le champ password
    - expect: Les caractères saisis apparaissent masqués (points ou astérisques)

#### 3.4. Affichage/masquage du mot de passe avec l'icône œil

**File:** `tests/login/login-toggle-password.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir un mot de passe dans le champ 'password'
    - expect: Le texte est masqué
  3. Cliquer sur l'icône 'œil' (togglepassword) à côté du champ de mot de passe
    - expect: Le type du champ bascule de 'password' à 'text'
    - expect: Le mot de passe saisi est maintenant visible en clair
  4. Cliquer à nouveau sur l'icône 'œil'
    - expect: Le type du champ revient à 'password'
    - expect: Le mot de passe est à nouveau masqué

#### 3.5. Injection de caractères spéciaux dans les champs de connexion

**File:** `tests/login/login-special-chars.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Saisir des caractères SQL injection dans le champ username (ex: ' OR '1'='1' --)
  3. Saisir un mot de passe quelconque et cliquer sur 'Connection'
    - expect: La connexion échoue avec un message d'erreur standard
    - expect: Aucune donnée de la base de données n'est exposée
    - expect: L'application ne renvoie pas d'erreur SQL
  4. Saisir des caractères XSS dans le champ username (ex: <script>alert(1)</script>)
  5. Saisir un mot de passe quelconque et cliquer sur 'Connection'
    - expect: La connexion échoue
    - expect: Le script n'est pas exécuté
    - expect: La valeur est correctement échappée dans le message d'erreur

### 4. Mot de passe oublié

**Seed:** `tests/seed.spec.ts`

#### 4.1. Accéder à la page de mot de passe oublié

**File:** `tests/login/forgot-password-access.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Localiser et cliquer sur le lien 'Mot de passe oublié' (PasswordForgotten)
    - expect: L'utilisateur est redirigé vers /user/passwordforgotten.php
    - expect: Un formulaire de réinitialisation est affiché avec un champ pour saisir l'email ou l'identifiant

#### 4.2. Demande de réinitialisation avec un email valide

**File:** `tests/login/forgot-password-valid-email.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/user/passwordforgotten.php
    - expect: La page de réinitialisation s'affiche
  2. Saisir l'adresse email d'un compte actif existant dans le formulaire
  3. Soumettre le formulaire
    - expect: Un message de confirmation s'affiche indiquant qu'un email a été envoyé
    - expect: Aucune information sur l'existence du compte n'est révélée (comportement sécurisé)

#### 4.3. Demande de réinitialisation avec un email inexistant

**File:** `tests/login/forgot-password-unknown-email.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/user/passwordforgotten.php
    - expect: La page de réinitialisation s'affiche
  2. Saisir une adresse email qui n'existe pas dans la base (ex: inexistant@test.com)
  3. Soumettre le formulaire
    - expect: Le comportement est identique à celui d'un email valide (message de confirmation générique)
    - expect: L'application ne révèle pas si l'adresse existe ou non (énumération impossible)

### 5. Interface et accessibilité

**Seed:** `tests/seed.spec.ts`

#### 5.1. Navigation par tabulation dans le formulaire de connexion

**File:** `tests/login/login-tab-navigation.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Vérifier que le champ 'username' reçoit le focus automatiquement (autofocus)
    - expect: Le curseur est positionné dans le champ username sans action de l'utilisateur
  3. Appuyer sur Tab depuis le champ 'username'
    - expect: Le focus passe au champ 'password' (tabindex=2)
  4. Appuyer sur Tab depuis le champ 'password'
    - expect: Le focus passe au bouton 'Connection' (tabindex=5)

#### 5.2. Affichage correct du logo et du titre de l'application

**File:** `tests/login/login-ui-elements.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Vérifier la présence du logo de l'application (img#img_logo)
    - expect: Le logo s'affiche correctement sans erreur 404
  3. Vérifier le titre de la page HTML
    - expect: Le titre contient 'Login' et inclut '@' suivi de la version Dolibarr (ex: 'Login @ Dolibarr 20.x.x')
  4. Vérifier la présence du titre de connexion dans la zone .login_table_title
    - expect: Le nom de l'application (Dolibarr ou titre personnalisé) s'affiche correctement

#### 5.3. Vérification des placeholders et labels des champs

**File:** `tests/login/login-field-attributes.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php
    - expect: La page de connexion s'affiche
  2. Inspecter le champ 'username'
    - expect: Le placeholder affiche 'Login' (ou la traduction en cours)
    - expect: L'attribut maxlength est 255
    - expect: L'attribut autocapitalize est 'off'
  3. Inspecter le champ 'password'
    - expect: Le placeholder affiche 'Password' (ou la traduction en cours)
    - expect: L'attribut maxlength est 128
    - expect: L'attribut type est 'password'

#### 5.4. La page de connexion n'est pas accessible lorsque l'utilisateur est déjà connecté

**File:** `tests/login/login-already-authenticated.spec.ts`

**Steps:**
  1. Naviguer vers http://localhost/index.php et se connecter avec des identifiants valides
    - expect: L'utilisateur est redirigé vers le tableau de bord
  2. Naviguer à nouveau vers http://localhost/index.php
    - expect: L'utilisateur est automatiquement redirigé vers le tableau de bord ou la page d'accueil
    - expect: La page de connexion ne s'affiche pas à nouveau

#### 5.5. Limitation de taille des requêtes (protection DDOS)

**File:** `tests/login/login-large-payload.spec.ts`

**Steps:**
  1. Envoyer une requête POST vers la page de connexion avec un Content-Length supérieur à 10 000 octets
    - expect: Le serveur répond avec le code HTTP 413 (Request Entity Too Large)
    - expect: Un message d'erreur approprié s'affiche ('ErrorRequestTooLarge')
