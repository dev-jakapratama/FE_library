import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:3000/api/v1';

function App() {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBooks(),
        fetchBorrowers(),
        fetchLoans()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data. Make sure backend is running on port 3000');
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    const response = await axios.get(`${API_BASE}/books`);
    setBooks(response.data);
  };

  const fetchBorrowers = async () => {
    const response = await axios.get(`${API_BASE}/borrowers`);
    setBorrowers(response.data);
  };

  const fetchLoans = async () => {
    const response = await axios.get(`${API_BASE}/loans`);
    setLoans(response.data);
  };

  if (loading) {
    return <div className="loading">Loading Library Data...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Library Loan Management System</h1>
        <button onClick={fetchAllData} className="refresh-btn">
          🔄 Refresh All Data
        </button>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'books' ? 'active' : ''} 
          onClick={() => setActiveTab('books')}
        >
          📖 Books ({books.length})
        </button>
        <button 
          className={activeTab === 'borrowers' ? 'active' : ''} 
          onClick={() => setActiveTab('borrowers')}
        >
          👥 Borrowers ({borrowers.length})
        </button>
        <button 
          className={activeTab === 'loans' ? 'active' : ''} 
          onClick={() => setActiveTab('loans')}
        >
          🔄 Loans ({loans.filter(l => l.status === 'active').length} active)
        </button>
        <button 
          className={activeTab === 'new-loan' ? 'active' : ''} 
          onClick={() => setActiveTab('new-loan')}
        >
          ➕ New Loan
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'books' && (
          <BooksTab books={books} onRefresh={fetchBooks} />
        )}
        {activeTab === 'borrowers' && (
          <BorrowersTab borrowers={borrowers} onRefresh={fetchBorrowers} />
        )}
        {activeTab === 'loans' && (
          <LoansTab loans={loans} onRefresh={fetchAllData} />
        )}
        {activeTab === 'new-loan' && (
          <NewLoanTab 
            books={books} 
            borrowers={borrowers} 
            onLoanCreated={fetchAllData}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Library System Demo - Backend: http://localhost:3000</p>
      </footer>
    </div>
  );
}

function BooksTab({ books, onRefresh }) {
  const [newBook, setNewBook] = useState({ title: '', isbn: '', stock: '' });
  const [editingBook, setEditingBook] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/books`, { book: newBook });
      setNewBook({ title: '', isbn: '', stock: '' });
      onRefresh();
      alert('Book created successfully!');
    } catch (error) {
      alert('Error creating book: ' + (error.response?.data || error.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/books/${editingBook.id}`, { 
        book: editingBook 
      });
      setEditingBook(null);
      onRefresh();
      alert('Book updated successfully!');
    } catch (error) {
      alert('Error updating book: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_BASE}/books/${bookId}`);
        onRefresh();
        alert('Book deleted successfully!');
      } catch (error) {
        alert('Error deleting book: ' + (error.response?.data || error.message));
      }
    }
  };

  return (
    <div className="tab-content">
      <h2>📖 Books Management</h2>
      
      <div className="form-section">
        <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
        <form onSubmit={editingBook ? handleUpdate : handleSubmit} className="form">
          <input
            type="text"
            placeholder="Book Title"
            value={editingBook ? editingBook.title : newBook.title}
            onChange={(e) => editingBook 
              ? setEditingBook({...editingBook, title: e.target.value})
              : setNewBook({...newBook, title: e.target.value})
            }
            required
          />
          <input
            type="text"
            placeholder="ISBN"
            value={editingBook ? editingBook.isbn : newBook.isbn}
            onChange={(e) => editingBook
              ? setEditingBook({...editingBook, isbn: e.target.value})
              : setNewBook({...newBook, isbn: e.target.value})
            }
            required
          />
          <input
            type="number"
            placeholder="Stock"
            min="0"
            value={editingBook ? editingBook.stock : newBook.stock}
            onChange={(e) => editingBook
              ? setEditingBook({...editingBook, stock: parseInt(e.target.value)})
              : setNewBook({...newBook, stock: parseInt(e.target.value)})
            }
            required
          />
          <div className="form-actions">
            <button type="submit">
              {editingBook ? 'Update Book' : 'Add Book'}
            </button>
            {editingBook && (
              <button 
                type="button" 
                onClick={() => setEditingBook(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-section">
        <h3>Book List</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>ISBN</th>
                <th>Total Stock</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id} className={book.available_copies === 0 ? 'out-of-stock' : ''}>
                  <td>{book.title}</td>
                  <td>{book.isbn}</td>
                  <td>{book.stock}</td>
                  <td>{book.available_copies}</td>
                  <td>
                    <span className={`status ${book.available_copies > 0 ? 'available' : 'unavailable'}`}>
                      {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => setEditingBook(book)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && (
            <div className="empty-state">
              No books found. Add some books to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BorrowersTab({ borrowers, onRefresh }) {
  const [newBorrower, setNewBorrower] = useState({ 
    id_card_number: '', 
    name: '', 
    email: '' 
  });
  const [editingBorrower, setEditingBorrower] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/borrowers`, { borrower: newBorrower });
      setNewBorrower({ id_card_number: '', name: '', email: '' });
      onRefresh();
      alert('Borrower created successfully!');
    } catch (error) {
      alert('Error creating borrower: ' + (error.response?.data || error.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/borrowers/${editingBorrower.id}`, { 
        borrower: editingBorrower 
      });
      setEditingBorrower(null);
      onRefresh();
      alert('Borrower updated successfully!');
    } catch (error) {
      alert('Error updating borrower: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (borrowerId) => {
    if (window.confirm('Are you sure you want to delete this borrower?')) {
      try {
        await axios.delete(`${API_BASE}/borrowers/${borrowerId}`);
        onRefresh();
        alert('Borrower deleted successfully!');
      } catch (error) {
        alert('Error deleting borrower: ' + (error.response?.data || error.message));
      }
    }
  };

  return (
    <div className="tab-content">
      <h2>👥 Borrowers Management</h2>
      
      <div className="form-section">
        <h3>{editingBorrower ? 'Edit Borrower' : 'Add New Borrower'}</h3>
        <form onSubmit={editingBorrower ? handleUpdate : handleSubmit} className="form">
          <input
            type="text"
            placeholder="ID Card Number"
            value={editingBorrower ? editingBorrower.id_card_number : newBorrower.id_card_number}
            onChange={(e) => editingBorrower
              ? setEditingBorrower({...editingBorrower, id_card_number: e.target.value})
              : setNewBorrower({...newBorrower, id_card_number: e.target.value})
            }
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={editingBorrower ? editingBorrower.name : newBorrower.name}
            onChange={(e) => editingBorrower
              ? setEditingBorrower({...editingBorrower, name: e.target.value})
              : setNewBorrower({...newBorrower, name: e.target.value})
            }
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={editingBorrower ? editingBorrower.email : newBorrower.email}
            onChange={(e) => editingBorrower
              ? setEditingBorrower({...editingBorrower, email: e.target.value})
              : setNewBorrower({...newBorrower, email: e.target.value})
            }
            required
          />
          <div className="form-actions">
            <button type="submit">
              {editingBorrower ? 'Update Borrower' : 'Add Borrower'}
            </button>
            {editingBorrower && (
              <button 
                type="button" 
                onClick={() => setEditingBorrower(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-section">
        <h3>Borrower List</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Card</th>
                <th>Name</th>
                <th>Email</th>
                <th>Loan Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowers.map(borrower => (
                <tr key={borrower.id}>
                  <td>{borrower.id_card_number}</td>
                  <td>{borrower.name}</td>
                  <td>{borrower.email}</td>
                  <td>
                    <span className={`status ${borrower.has_active_loan ? 'active-loan' : 'no-loan'}`}>
                      {borrower.has_active_loan ? 'Has Active Loan' : 'No Active Loan'}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => setEditingBorrower(borrower)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(borrower.id)}
                      className="delete-btn"
                      disabled={borrower.has_active_loan}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {borrowers.length === 0 && (
            <div className="empty-state">
              No borrowers found. Add some borrowers to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoansTab({ loans, onRefresh }) {
  const [filter, setFilter] = useState('all'); // all, active, returned, overdue

  const handleReturn = async (loanId) => {
    try {
      await axios.post(`${API_BASE}/loans/${loanId}/return_book`);
      onRefresh();
      alert('Book returned successfully!');
    } catch (error) {
      alert('Error returning book: ' + (error.response?.data || error.message));
    }
  };

  const filteredLoans = loans.filter(loan => {
    switch (filter) {
      case 'active': return loan.status === 'active';
      case 'returned': return loan.status === 'returned';
      case 'overdue': return loan.overdue;
      default: return true;
    }
  });

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const overdueLoans = loans.filter(loan => loan.overdue);

  return (
    <div className="tab-content">
      <h2>🔄 Loans Management</h2>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Loans</h3>
          <p>{loans.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Loans</h3>
          <p>{activeLoans.length}</p>
        </div>
        <div className="stat-card overdue">
          <h3>Overdue Loans</h3>
          <p>{overdueLoans.length}</p>
        </div>
        <div className="stat-card returned">
          <h3>Returned</h3>
          <p>{loans.filter(l => l.status === 'returned').length}</p>
        </div>
      </div>

      <div className="filter-section">
        <label>Filter: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Loans</option>
          <option value="active">Active Loans</option>
          <option value="returned">Returned Loans</option>
          <option value="overdue">Overdue Loans</option>
        </select>
      </div>

      <div className="table-section">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Book</th>
                <th>Borrowed Date</th>
                <th>Due Date</th>
                <th>Returned Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map(loan => (
                <tr key={loan.id} className={loan.overdue ? 'overdue-row' : ''}>
                  <td>
                    <strong>{loan.borrower?.name}</strong>
                    <br />
                    <small>{loan.borrower?.id_card_number}</small>
                  </td>
                  <td>
                    <strong>{loan.book?.title}</strong>
                    <br />
                    <small>ISBN: {loan.book?.isbn}</small>
                  </td>
                  <td>{new Date(loan.borrowed_at).toLocaleDateString()}</td>
                  <td>{new Date(loan.due_date).toLocaleDateString()}</td>
                  <td>
                    {loan.returned_at 
                      ? new Date(loan.returned_at).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td>
                    <span className={`status ${
                      loan.status === 'returned' ? 'returned' :
                      loan.overdue ? 'overdue' : 'active'
                    }`}>
                      {loan.status === 'returned' ? 'Returned' :
                       loan.overdue ? `Overdue (${loan.days_overdue} days)` : 'Active'}
                    </span>
                  </td>
                  <td className="actions">
                    {loan.status === 'active' && (
                      <button 
                        onClick={() => handleReturn(loan.id)}
                        className="return-btn"
                      >
                        Return Book
                      </button>
                    )}
                    {loan.status === 'returned' && (
                      <span className="returned-badge">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLoans.length === 0 && (
            <div className="empty-state">
              No loans found matching the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewLoanTab({ books, borrowers, onLoanCreated }) {
  const [newLoan, setNewLoan] = useState({ 
    book_id: '', 
    borrower_id: '', 
    due_date: '' 
  });
  const [loading, setLoading] = useState(false);

  const availableBooks = books.filter(book => book.available_copies > 0);
  const availableBorrowers = borrowers.filter(borrower => !borrower.has_active_loan);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_BASE}/loans`, { loan: newLoan });
      setNewLoan({ book_id: '', borrower_id: '', due_date: '' });
      onLoanCreated();
      alert('Loan created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.base || 
                          error.response?.data?.due_date || 
                          error.message;
      alert('Error creating loan: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="tab-content">
      <h2>➕ Create New Loan</h2>
      
      <div className="loan-form-section">
        <form onSubmit={handleSubmit} className="form loan-form">
          <div className="form-group">
            <label>Select Book:</label>
            <select
              value={newLoan.book_id}
              onChange={(e) => setNewLoan({...newLoan, book_id: e.target.value})}
              required
            >
              <option value="">Choose a book...</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} (Available: {book.available_copies}/{book.stock})
                </option>
              ))}
            </select>
            {availableBooks.length === 0 && (
              <p className="warning">No books available for loan</p>
            )}
          </div>

          <div className="form-group">
            <label>Select Borrower:</label>
            <select
              value={newLoan.borrower_id}
              onChange={(e) => setNewLoan({...newLoan, borrower_id: e.target.value})}
              required
            >
              <option value="">Choose a borrower...</option>
              {availableBorrowers.map(borrower => (
                <option key={borrower.id} value={borrower.id}>
                  {borrower.name} ({borrower.id_card_number})
                </option>
              ))}
            </select>
            {availableBorrowers.length === 0 && (
              <p className="warning">No borrowers available for new loans</p>
            )}
          </div>

          <div className="form-group">
            <label>Due Date (max 30 days):</label>
            <input
              type="date"
              value={newLoan.due_date}
              onChange={(e) => setNewLoan({...newLoan, due_date: e.target.value})}
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              required
            />
            <small>Loan duration cannot exceed 30 days</small>
          </div>

          <button 
            type="submit" 
            disabled={loading || availableBooks.length === 0 || availableBorrowers.length === 0}
            className="submit-btn"
          >
            {loading ? 'Creating Loan...' : 'Create Loan'}
          </button>
        </form>
      </div>

      <div className="info-section">
        <div className="info-box">
          <h3>📋 Loan Rules:</h3>
          <ul>
            <li>✅ Only available books can be borrowed</li>
            <li>✅ Borrowers can only have one active loan at a time</li>
            <li>✅ Maximum loan duration is 30 days</li>
            <li>✅ One book per loan transaction</li>
            <li>❌ Books cannot be borrowed if out of stock</li>
            <li>❌ Borrowers with active loans cannot borrow more books</li>
          </ul>
        </div>

        <div className="availability-section">
          <div className="availability-card">
            <h4>Available Books: {availableBooks.length}</h4>
            <ul>
              {availableBooks.slice(0, 5).map(book => (
                <li key={book.id}>
                  {book.title} ({book.available_copies} available)
                </li>
              ))}
              {availableBooks.length > 5 && (
                <li>... and {availableBooks.length - 5} more</li>
              )}
            </ul>
          </div>

          <div className="availability-card">
            <h4>Available Borrowers: {availableBorrowers.length}</h4>
            <ul>
              {availableBorrowers.slice(0, 5).map(borrower => (
                <li key={borrower.id}>
                  {borrower.name} ({borrower.id_card_number})
                </li>
              ))}
              {availableBorrowers.length > 5 && (
                <li>... and {availableBorrowers.length - 5} more</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;