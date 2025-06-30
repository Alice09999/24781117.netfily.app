document.addEventListener('DOMContentLoaded', function() {
  const bookForm = document.getElementById('bookForm');
  const searchBook = document.getElementById('searchBook');
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  const bookFormIsComplete = document.getElementById('bookFormIsComplete');
  const bookFormSubmitSpan = document.querySelector('#bookFormSubmit span');

  // Update submit button text based on checkbox
  bookFormIsComplete.addEventListener('change', function() {
    bookFormSubmitSpan.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
  });

  // Load books from localStorage
  loadBooks();

  // Add new book
  bookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    
    const book = {
      id: Number(new Date()),
      title,
      author,
      year,
      isComplete
    };
    
    addBook(book);
    saveBooks();
    bookForm.reset();
    bookFormSubmitSpan.textContent = 'Belum selesai dibaca';
  });

  // Search books
  searchBook.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
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

  // Function to get all books from localStorage
  function getBooks() {
    const books = localStorage.getItem('books');
    return books ? JSON.parse(books) : [];
  }

  // Function to save books to localStorage
  function saveBooks() {
    const books = getBooks();
    localStorage.setItem('books', JSON.stringify(books));
  }

  // Function to load and render books
  function loadBooks() {
    const books = getBooks();
    renderBooks(books);
  }

  // Function to render books to the DOM
  function renderBooks(books) {
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    books.forEach(book => {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    });
  }

  // Function to create book element
  function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.dataset.bookid = book.id;
    bookElement.dataset.testid = 'bookItem';
    
    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">
          ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
        </button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;
    
    // Add event listeners to buttons
    const isCompleteButton = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
    const deleteButton = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
    const editButton = bookElement.querySelector('[data-testid="bookItemEditButton"]');
    
    isCompleteButton.addEventListener('click', function() {
      toggleBookStatus(book.id);
    });
    
    deleteButton.addEventListener('click', function() {
      deleteBook(book.id);
    });
    
    editButton.addEventListener('click', function() {
      editBook(book);
    });
    
    return bookElement;
  }

  // Function to add a new book
  function addBook(book) {
    const books = getBooks();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks(books);
  }

  // Function to toggle book status (complete/incomplete)
  function toggleBookStatus(bookId) {
    const books = getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
      books[bookIndex].isComplete = !books[bookIndex].isComplete;
      saveBooks();
      loadBooks();
    }
  }

  // Function to delete a book
  function deleteBook(bookId) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini? 🏰')) {
      const books = getBooks();
      const filteredBooks = books.filter(book => book.id !== bookId);
      localStorage.setItem('books', JSON.stringify(filteredBooks));
      loadBooks();
    }
  }

  // Function to edit a book
  function editBook(book) {
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;
    bookFormSubmitSpan.textContent = book.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
    
    // Change submit button to update
    const submitButton = document.getElementById('bookFormSubmit');
    submitButton.textContent = 'Perbarui Buku ';
    submitButton.appendChild(bookFormSubmitSpan);
    
    // Remove previous submit event and add update event
    bookForm.replaceWith(bookForm.cloneNode(true));
    document.getElementById('bookForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const books = getBooks();
      const bookIndex = books.findIndex(b => b.id === book.id);
      
      if (bookIndex !== -1) {
        books[bookIndex].title = document.getElementById('bookFormTitle').value;
        books[bookIndex].author = document.getElementById('bookFormAuthor').value;
        books[bookIndex].year = parseInt(document.getElementById('bookFormYear').value);
        books[bookIndex].isComplete = document.getElementById('bookFormIsComplete').checked;
        
        saveBooks();
        loadBooks();
        
        // Reset form
        bookForm.reset();
        submitButton.textContent = 'Masukkan Buku ke rak ';
        submitButton.appendChild(bookFormSubmitSpan);
        bookFormSubmitSpan.textContent = 'Belum selesai dibaca';
        
        // Restore original submit event
        bookForm.replaceWith(bookForm.cloneNode(true));
        document.getElementById('bookForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const title = document.getElementById('bookFormTitle').value;
          const author = document.getElementById('bookFormAuthor').value;
          const year = parseInt(document.getElementById('bookFormYear').value);
          const isComplete = document.getElementById('bookFormIsComplete').checked;
          
          const newBook = {
            id: Number(new Date()),
            title,
            author,
            year,
            isComplete
          };
          
          addBook(newBook);
          saveBooks();
          bookForm.reset();
          bookFormSubmitSpan.textContent = 'Belum selesai dibaca';
        });
      }
    });
  }
});
