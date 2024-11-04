



const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./menu.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL
  )`);

  // Você pode adicionar dados iniciais aqui ou em um arquivo JSON
  const insert = db.prepare(`INSERT INTO menu (name, price, description, image) VALUES (?, ?, ?, ?)`);
  
  // Exemplo de inserção de dados
  /*
  insert.run("Smash burger", 24.90, "O smash burger é feito com carne moída fresca prensada na chapa...", "/assets/hamb-1.png");
  insert.run("Hambúrguer Duplo", 32.90, "Um hambúrguer duplo smash é feito com duas porções de carne...", "/assets/hamb-2.png");
  insert.run("Pocket Cheddar", 25.90, "Um hambúrguer duplo smash com cheddar...", "/assets/hamb-3.png");
  insert.run("Chicken burger", 24.90, "Um hambúrguer de frango crocante...", "/assets/hamb-4.png");
  insert.finalize();
  */
});

module.exports = db;


