# Plan de test - Menu Companies / Tiers / Contacts / Partenariats

## Vue d'ensemble

Ce plan couvre la zone Dolibarr accessible via `http://localhost/societe/index.php?mainmenu=companies`, en se concentrant sur le menu de gauche et les parcours liés aux **tiers**, **contacts/adresses** et **partenariats**. L'exploration directe de l'interface a été partiellement bloquée par l'authentification sur `localhost`, donc le plan combine l'observation de l'écran de connexion et la structure fonctionnelle attendue de cette zone.

## Préconditions

- Utiliser un navigateur avec une session propre.
- Disposer d'un utilisateur valide ayant accès au menu `Companies`.
- Préparer des données de test avec au minimum :
  - 1 prospect
  - 1 client
  - 1 fournisseur
  - 1 tiers avec au moins 1 contact lié
  - 1 partenariat si le module est activé
- Réserver les scénarios destructifs à des données jetables.

## Scénarios de test

### 1. Accès et navigation du menu gauche

**Seed:** `tests/seed.spec.ts`

#### 1.1. Accès à la zone Companies avec ou sans session

**File:** `tests/plan/companies-access-navigation.spec.ts`

**Steps:**
  1. Ouvrir `http://localhost/societe/index.php?mainmenu=companies` dans un nouveau contexte navigateur.
    - expect: Sans session active, l'application redirige vers la page de connexion ou affiche l'écran de login.
    - expect: L'accès au contenu `Companies` est refusé tant que l'utilisateur n'est pas authentifié.
  2. Se connecter avec un compte valide puis revenir sur l'URL.
    - expect: La page `Companies` devient accessible.
    - expect: Le menu gauche s'affiche selon les modules activés et les permissions du compte.

#### 1.2. Présence des entrées de menu pour Tiers, Contacts et Partenariats

**File:** `tests/plan/companies-left-menu-visibility.spec.ts`

**Steps:**
  1. Inspecter le menu de gauche depuis la zone `Companies`.
    - expect: La zone `Tiers` est visible si le module sociétés est actif et que l'utilisateur a les droits de lecture.
    - expect: La zone `Contacts / Adresses` est visible si les droits de lecture sur les contacts sont présents.
    - expect: La zone `Partenariats` est visible si le module correspondant est activé et autorisé.
  2. Ouvrir chaque groupe fonctionnel visible.
    - expect: `Tiers` expose au minimum la liste et, selon le paramétrage, les vues prospects, clients et fournisseurs.
    - expect: `Contacts` expose au minimum nouveau contact, liste, prospects, clients, fournisseurs et autres si ces vues existent.
    - expect: `Partenariats` expose la liste et la création si le module et les droits d'écriture sont disponibles.

#### 1.3. Navigation entre les entrées du menu gauche

**File:** `tests/plan/companies-left-menu-navigation-context.spec.ts`

**Steps:**
  1. Ouvrir successivement les entrées visibles du menu gauche.
    - expect: Chaque lien charge la bonne page sans erreur ni redirection inattendue.
    - expect: L'entrée courante reste visuellement sélectionnée ou contextualisée correctement.
    - expect: Les boutons précédent/suivant du navigateur conservent un comportement cohérent.

### 2. Tiers

**Seed:** `tests/seed.spec.ts`

#### 2.1. Création d'un tiers générique

**File:** `tests/plan/thirdparties-create-generic.spec.ts`

**Steps:**
  1. Ouvrir `Nouveau tiers`.
    - expect: Le formulaire de création s'affiche.
  2. Saisir un nom unique et les données minimales valides, puis enregistrer.
    - expect: Le tiers est créé avec succès.
    - expect: La fiche du tiers s'ouvre après l'enregistrement.
    - expect: Le tiers apparaît dans la liste et est retrouvable par recherche.

#### 2.2. Création par type : prospect, client, fournisseur

**File:** `tests/plan/thirdparties-create-types.spec.ts`

**Steps:**
  1. Créer un tiers prospect, un tiers client, un tiers fournisseur, puis un tiers mixte si la combinaison est autorisée.
    - expect: Chaque enregistrement valide est accepté.
    - expect: Chaque tiers apparaît dans les bonnes listes filtrées.
    - expect: Les listes par type n'affichent pas de tiers hors périmètre.

#### 2.3. Validation des champs obligatoires et des formats

**File:** `tests/plan/thirdparties-validation.spec.ts`

**Steps:**
  1. Tenter d'enregistrer un tiers sans nom.
    - expect: Une erreur de validation indique que le nom du tiers est obligatoire.
  2. Tenter d'enregistrer un tiers avec un email invalide et une URL invalide.
    - expect: Les formats invalides sont rejetés.
    - expect: Aucun enregistrement n'est créé tant que les erreurs persistent.
  3. Si le paramétrage le permet, tester les options liées au mailing et au `No Email`.
    - expect: Les règles de validation restent cohérentes avec la configuration.

#### 2.4. Recherche, filtres, tri et pagination des listes de tiers

**File:** `tests/plan/thirdparties-list-behavior.spec.ts`

**Steps:**
  1. Ouvrir la liste des tiers avec plusieurs données de test.
    - expect: La liste affiche des colonnes cohérentes, les lignes attendues et la pagination.
  2. Utiliser la recherche rapide et les filtres par nom, alias, email, téléphone, ville, pays, statut et type.
    - expect: Les résultats correspondent aux critères saisis.
    - expect: La remise à zéro des filtres restaure la liste de référence.
    - expect: Le tri fonctionne de façon stable.
  3. Ouvrir les sous-listes prospects, clients et fournisseurs.
    - expect: Les filtres par type sont appliqués correctement.
    - expect: Le tri et la pagination restent opérationnels.

#### 2.5. Modification, suppression, fusion et cas limites

**File:** `tests/plan/thirdparties-update-delete-merge.spec.ts`

**Steps:**
  1. Modifier un tiers existant.
    - expect: Les changements sur l'adresse, le téléphone, l'email et les types sont persistés après rechargement.
  2. Supprimer un tiers jetable.
    - expect: Le tiers disparaît de la liste et son URL ne permet plus un accès normal à la fiche.
  3. Si la fusion existe, fusionner deux tiers compatibles.
    - expect: L'interface exige une source valide.
    - expect: La fusion réussie conserve le tiers survivant et ses liens utiles.
  4. Si le mode `particulier` existe, créer un tiers particulier.
    - expect: Le contact/adresse associé est généré correctement.
    - expect: Les liens entre tiers et contact sont disponibles.

### 3. Contacts / Adresses

**Seed:** `tests/seed.spec.ts`

#### 3.1. Création d'un contact rattaché à un tiers

**File:** `tests/plan/contacts-create-linked.spec.ts`

**Steps:**
  1. Ouvrir `Nouveau contact` et sélectionner un tiers existant.
    - expect: Le formulaire permet l'association au tiers.
  2. Saisir les champs requis et valides puis enregistrer.
    - expect: Le contact est créé avec succès.
    - expect: La fiche contact s'ouvre.
    - expect: Le contact apparaît dans la liste globale et dans l'onglet contacts du tiers parent.

#### 3.2. Création d'un contact non rattaché / Autres

**File:** `tests/plan/contacts-create-other.spec.ts`

**Steps:**
  1. Tenter de créer un contact sans tiers si l'interface l'autorise.
    - expect: Le contact n'est créé que si cette variante est supportée par l'environnement.
    - expect: Le contact apparaît dans la vue `Autres`.

#### 3.3. Validation des champs obligatoires des contacts

**File:** `tests/plan/contacts-validation.spec.ts`

**Steps:**
  1. Tenter d'enregistrer un contact sans nom/libellé.
    - expect: Une erreur indique que ce champ est obligatoire.
  2. Tenter d'enregistrer un contact avec un email invalide.
    - expect: L'enregistrement est refusé avec un message explicite.
  3. Si applicable, tester les règles liées à l'emailing.
    - expect: Les validations sont cohérentes avec la configuration active.

#### 3.4. Recherche, filtres et vues de contacts

**File:** `tests/plan/contacts-list-behavior.spec.ts`

**Steps:**
  1. Ouvrir la liste principale puis les sous-listes prospects, clients, fournisseurs et autres.
    - expect: Chaque vue n'affiche que les contacts attendus.
    - expect: Le statut actif/inactif reste lisible et cohérent.
  2. Filtrer par nom, prénom, société, poste, email, téléphone, ville, pays, catégorie et statut selon les champs présents.
    - expect: Les résultats correspondent au filtrage.
    - expect: Le retrait des filtres restaure l'ensemble des résultats.
    - expect: Le tri et la pagination restent fonctionnels.

#### 3.5. Modification, activation, suppression et création d'utilisateur

**File:** `tests/plan/contacts-update-status-delete.spec.ts`

**Steps:**
  1. Modifier un contact existant.
    - expect: Les modifications sont visibles après sauvegarde et rechargement.
  2. Désactiver puis réactiver un contact si l'action existe.
    - expect: Le changement de statut est visible sur la fiche et dans les listes.
  3. Supprimer un contact jetable.
    - expect: Le contact disparaît de la liste globale et de la fiche tiers associée.
  4. Si la fonctionnalité existe, créer un utilisateur depuis un contact.
    - expect: En cas de succès, un utilisateur lié est créé.
    - expect: En cas d'erreur, le message est exploitable et la fiche contact reste saine.

#### 3.6. Liens croisés entre tiers et contacts

**File:** `tests/plan/contacts-thirdparty-crosslinking.spec.ts`

**Steps:**
  1. Depuis une fiche tiers, ouvrir la liste des contacts liés.
    - expect: La relation parent/enfant est visible.
  2. Depuis une fiche contact, revenir vers le tiers lié.
    - expect: Le tiers lié s'ouvre correctement.
    - expect: Les mises à jour restent cohérentes des deux côtés.
  3. Si des contacts privés existent, vérifier les règles de visibilité avec plusieurs rôles.
    - expect: Les utilisateurs non autorisés sont bloqués.
    - expect: Les utilisateurs autorisés conservent les droits attendus.

### 4. Partenariats

**Seed:** `tests/seed.spec.ts`

#### 4.1. Visibilité du menu et activation du module

**File:** `tests/plan/partnership-menu-visibility.spec.ts`

**Steps:**
  1. Vérifier le menu avec un utilisateur autorisé puis non autorisé.
    - expect: Avec le module actif et les droits de lecture, `Partenariats` est visible.
    - expect: Sans droits ou sans module, l'entrée est masquée ou protégée proprement.

#### 4.2. Création d'un partenariat

**File:** `tests/plan/partnership-create.spec.ts`

**Steps:**
  1. Ouvrir `Nouveau partenariat`.
    - expect: Le formulaire affiche les champs obligatoires.
  2. Saisir un type, un tiers lié et une date de début valides, puis enregistrer.
    - expect: Le partenariat est créé avec succès.
    - expect: La fiche partenariat s'ouvre.
    - expect: Le partenariat apparaît dans la liste.

#### 4.3. Validation et contrôles sur les dates

**File:** `tests/plan/partnership-validation.spec.ts`

**Steps:**
  1. Tenter d'enregistrer sans type, sans tiers lié et sans date de début.
    - expect: L'enregistrement est bloqué tant que les champs obligatoires manquent.
  2. Tester des cas limites sur les dates.
    - expect: Une date de fin antérieure à la date de début est refusée ou gérée explicitement.
    - expect: Les valeurs acceptées restent cohérentes après rechargement.

#### 4.4. Liste, filtres, statuts et actions de masse

**File:** `tests/plan/partnership-list-and-mass-actions.spec.ts`

**Steps:**
  1. Ouvrir la liste des partenariats avec plusieurs statuts.
    - expect: Les colonnes utiles sont visibles et exploitables.
  2. Filtrer par type, tiers, statut et dates lorsque ces champs existent.
    - expect: Le filtrage, le tri et la pagination fonctionnent correctement.
  3. Tester les actions de masse disponibles.
    - expect: Les transitions valides réussissent.
    - expect: Les transitions invalides affichent un message clair sans effet de bord.

#### 4.5. Workflow de statut du partenariat

**File:** `tests/plan/partnership-status-workflow.spec.ts`

**Steps:**
  1. Créer un partenariat puis exécuter les actions de statut visibles.
    - expect: Seules les transitions autorisées sont possibles.
    - expect: Les transitions interdites sont bloquées proprement.
  2. Tester un refus sans motif puis avec motif si le workflow le prévoit.
    - expect: Le motif est requis si la règle métier l'impose.
    - expect: Le refus réussi persiste avec sa justification.

#### 4.6. Lien entre partenariat et contacts

**File:** `tests/plan/partnership-contacts.spec.ts`

**Steps:**
  1. Depuis la fiche partenariat, ouvrir l'onglet contacts si présent.
    - expect: L'ajout d'un contact existant est possible avec les bons droits.
  2. Ajouter un contact puis tenter de l'ajouter une seconde fois avec le même type.
    - expect: Le premier ajout réussit.
    - expect: Le doublon est refusé avec un message explicite.
  3. Retirer le lien entre partenariat et contact.
    - expect: Le lien est supprimé sans supprimer le contact global.

### 5. Permissions et régression

**Seed:** `tests/seed.spec.ts`

#### 5.1. Couverture par rôles

**File:** `tests/plan/permissions-coverage.spec.ts`

**Steps:**
  1. Rejouer la navigation principale avec un profil lecture seule, un profil édition et un profil administrateur.
    - expect: Le profil lecture seule ne voit pas les actions de modification.
    - expect: Le profil édition peut créer et modifier dans son périmètre.
    - expect: Les zones interdites sont masquées ou renvoient un accès refusé propre.

#### 5.2. Smoke de régression sur le menu Companies

**File:** `tests/plan/companies-regression-smoke.spec.ts`

**Steps:**
  1. Parcourir chaque entrée majeure du menu gauche.
    - expect: Aucun lien cassé, aucune erreur PHP et aucun état de menu incohérent.
  2. Créer un enregistrement valide dans chaque zone activée, le retrouver, le modifier puis vérifier les liens croisés.
    - expect: Les créations sont retrouvables depuis les bonnes listes.
    - expect: Les relations entre tiers, contacts et partenariats restent cohérentes après modification.
  3. Recharger les URL directes après les opérations.
    - expect: Le contexte, les permissions et les données restent cohérents.

## Points d'attention / inconnues

- L'exploration complète de l'UI a été limitée par l'écran de connexion.
- Le menu `Partenariats` dépend du module activé et des droits utilisateur.
- Certains parcours dépendent de la configuration locale : contacts privés, options mailing, fusion de tiers, création d'utilisateur depuis un contact, actions de statut disponibles.
