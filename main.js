document.addEventListener('DOMContentLoaded', function() {
  const bookForm = document.getElementById('bookForm');
  const searchBook = document.getElementById('searchBook');
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  const bookFormIsComplete = document.getElementById('bookFormIsComplete');
  const bookFormSubmitSpan = document.querySelector('#bookFormSubmit span');
  const submitButton = document.getElementById('bookFormSubmit');

  let currentEditId = null;

  // Update submit button text based on checkbox
  bookFormIsComplete.addEventListener('change', function() {
    bookFormSubmitSpan.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
  });

  // Load books from localStorage
  loadBooks();

  // Form submission handler
  bookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const yearInput = document.getElementById('bookFormYear').value.trim();
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    
    // Validate input
    if (!title || !author || !yearInput) {
      alert('Judul, Penulis, dan Tahun harus diisi!');
      return;
    }
    
    const year = parseInt(yearInput);
    if (isNaN(year)) {
      alert('Tahun harus berupa angka!');
      return;
    }
    
    if (currentEditId) {
      // Update existing book
      const books = getBooks();
      const index = books.findIndex(book => book.id === currentEditId);
      
      if (index !== -1) {
        books[index] = { id: currentEditId, title, author, year, isComplete };
        saveBooks(books);
        loadBooks();
      }
    } else {
      // Add new book
      const book = {
        id: Number(new Date()),
        title,
        author,
        year,
        isComplete
      };
      addBook(book);
    }
    
    resetForm();
  });

  // Search books
  searchBook.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase().trim();
    
    if (searchTerm === '') {
      loadBooks();
      return;
    }
    
    const books = getBooks();
    const filteredBooks = books.filter(book => 
      book.title.toLowerCase().includes(searchTerm) || 
      book.author.toLowerCase().includes(searchTerm)
    );
    
    renderBooks(filteredBooks);
  });

  function resetForm() {
    bookForm.reset();
    bookFormSubmitSpan.textContent = 'Belum selesai dibaca';
    submitButton.textContent = 'Masukkan Buku ke rak ';
    submitButton.appendChild(bookFormSubmitSpan);
    submitButton.classList.remove('edit-mode-button');
    bookForm.classList.remove('edit-mode');
    currentEditId = null;
  }

  function getBooks() {
    const books = localStorage.getItem('books');
    return books ? JSON.parse(books) : [];
  }

  function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books || getBooks()));
  }

  function loadBooks() {
    const books = getBooks();
    renderBooks(books);
  }

  function renderBooks(books) {
    // Clear both shelves first
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    // Filter valid books
    const validBooks = books.filter(book => 
      book.id && 
      book.title && 
      book.author && 
      !isNaN(book.year) && 
      typeof book.isComplete === 'boolean'
    );
    
    // Add books to their correct shelves
    validBooks.forEach(book => {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    });
  }

  function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.dataset.bookid = book.id;
    bookElement.dataset.testid = 'bookItem';
    bookElement.dataset.complete = book.isComplete;
    
    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title || 'Untitled'}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author || 'Unknown'}</p>
      <p data-testid="bookItemYear">Tahun: ${!isNaN(book.year) ? book.year : 'Unknown'}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">
          ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
        </button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;
    
    const isCompleteButton = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
    const deleteButton = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
    const editButton = bookElement.querySelector('[data-testid="bookItemEditButton"]');
    
    isCompleteButton.addEventListener('click', () => toggleBookStatus(book.id));
    deleteButton.addEventListener('click', () => deleteBook(book.id));
    editButton.addEventListener('click', () => editBook(book));
    
    return bookElement;
  }

  function addBook(book) {
    const books = getBooks();
    
    // Check for duplicate by title and author
    const isDuplicate = books.some(b => 
      b.title.toLowerCase() === book.title.toLowerCase() && 
      b.author.toLowerCase() === book.author.toLowerCase()
    );
    
    if (!isDuplicate) {
      books.push(book);
      saveBooks(books);
      renderBooks(books);
    } else {
      alert('Buku dengan judul dan penulis yang sama sudah ada!');
    }
  }

  function toggleBookStatus(bookId) {
    const books = getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
      books[bookIndex].isComplete = !books[bookIndex].isComplete;
      saveBooks(books);
      renderBooks(books);
    }
  }

  function deleteBook(bookId) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini? 🏰')) {
      const books = getBooks();
      const filteredBooks = books.filter(book => book.id !== bookId);
      saveBooks(filteredBooks);
      renderBooks(filteredBooks);
    }
  }

  function editBook(book) {
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;
    
    bookFormSubmitSpan.textContent = book.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
    submitButton.textContent = 'Perbarui Buku ';
    submitButton.appendChild(bookFormSubmitSpan);
    submitButton.classList.add('edit-mode-button');
    
    currentEditId = book.id;
    bookForm.classList.add('edit-mode');
    bookForm.scrollIntoView({ behavior: 'smooth' });
  }

  // Initialize with clean data if corrupted
  function checkDataIntegrity() {
    const books = getBooks();
    const hasInvalidData = books.some(book => 
      !book.id || !book.title || !book.author || isNaN(book.year) || typeof book.isComplete !== 'boolean'
    );
    
    if (hasInvalidData) {
      if (confirm('Data buku tidak valid. Bersihkan data?')) {
        localStorage.removeItem('books');
        loadBooks();
      }
    }
  }
  
  checkDataIntegrity();
});
