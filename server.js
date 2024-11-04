const express = require('express');
const cors = require('cors');
const db = require('./db'); // Módulo do banco de dados
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para obter itens do menu
app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para obter um item específico do menu
app.get('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM menu WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    res.json(row);
  });
});

// Rota para adicionar um novo item ao menu
app.post('/api/menu', (req, res) => {
  const { name, price, description, image } = req.body;
  db.run(`INSERT INTO menu (name, price, description, image) VALUES (?, ?, ?, ?)`, 
    [name, price, description, image], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Item adicionado com sucesso!' });
  });
});

// Rota para atualizar um item do menu
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, description, image } = req.body;

  db.run(`UPDATE menu SET name = ?, price = ?, description = ?, image = ? WHERE id = ?`,
    [name, price, description, image, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      res.json({ message: 'Item atualizado com sucesso!' });
  });
});

// Rota para deletar um item do menu
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM menu WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    res.json({ message: 'Item deletado com sucesso!' });
  });
});

// Rota para servir o index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
