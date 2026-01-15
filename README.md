# WebTTDN---Attendance-Web-App
## Link pagina deployed
https://frontend-production-d649.up.railway.app/

## Link test rute
https://webttdn-attendance-web-app-production.up.railway.app/

## Ghid de rulare
### 1. Instalare dependete si MySql
- instalare MySql
- in .env modificare DATABASE_URL="mysql://root:PASSWORD@localhost:3306/attendance_app" (password va fi inlocuit cu parola bazei de date locale)
- in bash in directorul backend de rulat npm install

### 2. Start la server
- de rulat npm run dev

### 3. Testare endpoints
- Ordinea de creare recomandata (din cauza relatiilor între tabele):
1. Participant
2. Event
3. Attendance (are nevoie de participant si event existente)

- Exemple 

<pre>
json { "name": "Noul Eveniment", "startTime": "2025-12-10T09:00:00.000Z", "endTime": "2025-12-10T11:00:00.000Z", "maxParticipants": 100, "description": "Eveniment test", "eventType": "Workshop" }
</pre>
<pre>
json { 
  "name": "John Doe", 
  "email": "john@example.com" 
}
</pre>
<pre>
json { 
  "eventId": 1, 
  "participantId": 1, 
  "status": "PRESENT" 
}
</pre>


#### Event Endpoints
- GET http://localhost:5000/events/ – lista evenimentelor


- POST http://localhost:5000/events/ – creeaza un eveniment


- GET http://localhost:5000/events/:id – detalii eveniment


- PUT http://localhost:5000/events/:id – actualizare eveniment


- DELETE http://localhost:5000/events/:id – stergere eveniment


#### Participant Endpoints
- GET http://localhost:5000/participants/ – lista participanților


- POST http://localhost:5000/participants/ – creeaza participant


- GET http://localhost:5000/participants/:id – detalii participant


- PUT http://localhost:5000/participants/:id – actualizare participant


- DELETE http://localhost:5000/participants/:id – stergere participant


#### Attendance Endpoints
- GET http://localhost:5000/attendance/ – lista prezentelor


- POST http://localhost:5000/attendance/ – creeaza prezenta


- GET http://localhost:5000/attendance/:id – detalii prezenta


- PUT http://localhost:5000/attendance/:id – actualizare prezenta


- DELETE http://localhost:5000/attendance/:id – stergere prezenta




## 📌 1. Tehnologii

###  Front-end
- **React.js**
- **Charting Library** (Chart.js / Recharts)
- **QR Scanner** (react-qr-reader / react-qr-scanner)

---

###  Back-end
- **Node.js**
- **Sequelize ORM**
- **MySQL**

---

## 📌 2. Funcționalități complete ale aplicației

### 1. Gestionare grupuri de evenimente
OE poate crea un grup de evenimente.  
Un grup poate conține:
- un singur eveniment
- sau o serie de evenimente recurente pe o perioadă de timp

---

### 2. Gestionarea evenimentelor
Un eveniment are trei stări:
- **CLOSED** – implicit, înainte de start
- **OPEN** – activ în intervalul programat
- **CLOSED** – după încheiere

La creare, un eveniment generează automat:
- cod text
- cod QR

---

### 3. Confirmarea prezenței
Participanții pot confirma prezența:
- prin introducerea codului text
- prin scanarea codului QR

---

### 4. Monitorizare în timp real
OE poate vizualiza:
- lista participanților prezenți
- ora exactă la care fiecare participant s-a înregistrat

---

### 5. Export date
OE poate exporta lista participanților:
- pentru un singur eveniment
- pentru un grup întreg
- format **CSV**

---

### 6. Dashboard statistic
Include:
- număr total de participanți la un eveniment
- număr participanți unici într-un grup de evenimente
- grafic al prezenței în timp
- procent de prezență vs absență

---

### 7. Marcarea manuală a prezenței
OE poate marca un participant ca **prezent** sau **absent**, manual, în cazurile când:
- participantul nu poate scana
- codul nu a funcționat
- există participanți invitați pe listă

---

### 8. Setări avansate pentru eveniment
OE poate configura:
- limită maximă de participanți
- descriere extinsă a evenimentului
- tipul evenimentului (curs, laborator, meeting, workshop)

---

### 9. Confirmări unice de prezență
- fiecare participant poate confirma o singură dată la același eveniment folosind o adresă IP

---

### 10. Confirmare vizuală
După confirmare, aplicația poate afișa:
- o animație (ex.: confetti)

---

### 11. Istoric prezențe
Participanții pot vedea:
- lista evenimentelor la care au fost prezenți
- ora confirmării
- status: prezent sau absent (dacă sunt adăugați de organizator)

---

### 12. Auto-generare evenimente
OE poate crea evenimente recurente prin selectarea:
- zilelor săptămânii
- intervalului de timp (ex: 1 martie – 30 aprilie)
- ora evenimentului

---

### 13. Cod acces cu expirare
- codul devine automat invalid când evenimentul este **CLOSED**
- opțional: cod rotativ (regenerează la fiecare X minute)

---

### 14. Editare / ștergere evenimente
OE poate modifica:
- data
- ora
- durata
- descrierea
- group-ul din care face parte evenimentul
