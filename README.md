# Path Crowdsourcing

## Obiettivo del Progetto

**Path Crowdsourcing** è una piattaforma back-end che implementa un sistema collaborativo (crowdsourcing) per la gestione e l'evoluzione di modelli di griglia utilizzati per il calcolo di percorsi ottimali. Il sistema permette a utenti autenticati di:

- **Creare modelli** di griglia (matrici binarie 0/1) specificando dimensioni e valori iniziali. Ogni creazione ha un costo in token (0.025 per cella), addebitato all'utente.
- **Eseguire l'algoritmo A*** su un modello esistente fornendo punto di partenza e arrivo, ottenendo il percorso minimo, il costo in passi e il tempo di esecuzione. Anche l'esecuzione consuma token (stesso costo della creazione).
- **Proporre modifiche** a una o più celle di un modello di cui non si è proprietari. La richiesta, che costa 0.25 token per cella, viene posta in stato *pending* in attesa di approvazione o rifiuto da parte del proprietario del modello.
- **Gestire le richieste** in sospeso: il proprietario può approvare o rifiutare singolarmente o in modalità bulk; in caso di approvazione, la griglia viene aggiornata automaticamente.
- **Visualizzare lo storico** delle modifiche di un modello, con filtri per data e stato, e lo stato di pending di un modello.
- **Ricevere notifiche** delle richieste pendenti relative ai propri modelli tramite apposite rotte.

Il sistema adotta un meccanismo di **token** per regolare l'uso delle risorse: ogni utente dispone di un credito iniziale (impostato tramite seed) che viene decrementato a ogni operazione a pagamento. Gli amministratori possono ricaricare il credito di un utente tramite un'endpoint dedicata. L'autenticazione è basata su **JWT** con firma RS256 e le chiavi sono caricate da file `docker-compose.yml`.


## Progettazione

### Diagrammi UML

#### Diagramma dei Casi d'Uso

> *[Da inserire]*

#### Diagrammi delle Sequenze

> *[Da inserire]*

---

### Descrizione dei Pattern Utilizzati

Il progetto adotta tre pattern architetturali principali, scelti per garantire separazione delle responsabilità, manutenibilità e scalabilità del codice.

#### 1. Model-View-Controller (MVC)

**Descrizione**:  
Il pattern MVC è stato implementato per separare la logica di presentazione (routes/controllers) dalla logica di business (services) e dalla gestione dei dati (models).

- **Model** (`models/`): Definisce la struttura dei dati e le relazioni tramite Sequelize. Gestisce la persistenza e le operazioni di base sul database.
- **Controller** (`controllers/`): Riceve le richieste HTTP, estrae i dati, chiama i servizi appropriati e restituisce le risposte al client.
- **Service** (`services/`): Contiene la logica di business dell'applicazione, coordina le operazioni tra repository e modelli, e gestisce le regole di dominio (es. calcolo costi in token, validazioni).

**Motivazione**:  
MVC è stato scelto perché:
- **Separa chiaramente le responsabilità**: I controller gestiscono solo l'input/output HTTP, i service contengono la logica di business, i modelli gestiscono la persistenza.
- **Facilita il testing**: È possibile testare service e repository in isolamento senza dipendere dal livello HTTP.
- **Migliora la manutenibilità**: Modifiche alla logica di business o alla struttura dei dati non influenzano il livello di presentazione.

**Esempio nel progetto**:  
`ModelController` delega a `ModelService` la creazione di un modello; `ModelService` utilizza `GridModelRepository` per l'accesso al database e `UserRepository` per la gestione dei token.

---

#### 2. Repository Pattern

**Descrizione**:  
Il pattern Repository è stato implementato per fornire un'interfaccia di accesso ai dati che astrae i dettagli dell'ORM (Sequelize) e del database sottostante.

- `UserRepository`: Gestisce le operazioni CRUD sugli utenti, inclusa la gestione dei token.
- `GridModelRepository`: Gestisce le operazioni sui modelli di griglia.
- `UpdateRequestRepository`: Gestisce le operazioni sulle richieste di aggiornamento, con metodi specializzati per filtri e ricerche complesse.

**Motivazione**:  
Il Repository pattern è stato scelto perché:
- **Astrazione del livello dati**: I service interagiscono con i repository senza conoscere i dettagli implementativi di Sequelize o del database.
- **Centralizzazione delle query**: Le query complesse (es. filtri per data, stato) sono incapsulate nei repository, evitando duplicazione di codice.
- **Facilita il testing**: È possibile mockare i repository per testare i service in isolamento.
- **Manutenibilità**: Cambiamenti nello schema del database o nell'ORM richiedono modifiche solo nei repository, non nei service.

**Esempio nel progetto**:  
`UpdateRequestService` utilizza `UpdateRequestRepository.findHistory()` per ottenere lo storico delle modifiche con filtri, senza dover costruire manualmente le condizioni `WHERE` in ogni chiamata.

---

#### 3. Chain of Responsibility (Middleware)

**Descrizione**:  
Il pattern Chain of Responsibility è stato implementato attraverso il sistema di middleware di Express. Ogni richiesta attraversa una catena di middleware che gestiscono aspetti specifici in sequenza.

- `authMiddleware`: Verifica la presenza e la validità del token JWT.
- `roleMiddleware`: Controlla che l'utente abbia il ruolo richiesto (es. admin).
- `tokenCheckMiddleware`: Verifica che l'utente abbia credito sufficiente per eseguire l'operazione.
- Middleware di validazione (`express-validator` + `validate`): Validano i dati in input.
- `errorMiddleware`: Gestisce centralmente gli errori e restituisce risposte JSON formattate.

**Motivazione**:  
La Chain of Responsibility è stata scelta perché:
- **Separazione delle responsabilità**: Ogni middleware ha un compito specifico e ben definito (autenticazione, autorizzazione, validazione, gestione errori).
- **Componibilità**: I middleware possono essere combinati liberamente sulle rotte, consentendo di riutilizzare la stessa logica in contesti diversi.
- **Manutenibilità**: Aggiungere o modificare un comportamento (es. aggiungere un nuovo controllo) richiede solo di inserire un nuovo middleware nella catena, senza toccare il codice esistente.
- **Gestione centralizzata degli errori**: `errorMiddleware` cattura tutte le eccezioni e restituisce risposte uniformi, migliorando l'esperienza del client.

**Esempio nel progetto**:  
La rotta `POST /models/create` utilizza una catena di middleware:
1. `authMiddleware` → verifica autenticazione
2. `roleMiddleware("user")` → verifica ruolo
3. `tokenCheckMiddleware` → verifica credito
4. Middleware di validazione → validano `width`, `height`, `grid`
5. `validate` → trasforma errori di validazione in risposta 400
6. `modelController.createModel` → esegue la logica di business

In caso di errore in qualsiasi punto della catena, `errorMiddleware` gestisce l'eccezione e restituisce una risposta appropriata.

---

### Riassunto dei Pattern Utilizzati

| Pattern | Scopo | Beneficio principale |
|---------|-------|---------------------|
| **MVC** | Separazione presentazione, business e dati | Manutenibilità e testabilità |
| **Repository** | Astrazione del livello di accesso ai dati | Disaccoppiamento e centralizzazione delle query |
| **Chain of Responsibility** | Gestione delle richieste attraverso middleware componibili | Separazione delle responsabilità e riusabilità |
