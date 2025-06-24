// Toggle visibility
document.getElementById('toggle-text').addEventListener('click', () => {
    document.getElementById('toggle-content')
      .classList.toggle('hidden');
  });
  
  // Show alert
  document.getElementById('show-alert').addEventListener('click', () =>
    alert('This is a test alert for Selenium!')
  );
  
  // Load content
  document.getElementById('load-content').addEventListener('click', () => {
    document.getElementById('loaded-content').innerHTML =
      '<p class="text-blue-700">This content was loaded dynamically!</p>';
  });
  
  // Countdown timer
  document.getElementById('start-countdown').addEventListener('click', () => {
    let counter = 10;
    const el = document.getElementById('countdown');
    const interval = setInterval(() => {
      counter--;
      el.textContent = counter <= 0 ? 'Done!' : counter;
      if (counter <= 0) clearInterval(interval);
    }, 1000);
  });
  
  // Form submit
  document.getElementById('test-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Form submitted!');
  });
  
  // Rating display
  document.getElementById('rating').addEventListener('input', function () {
    document.getElementById('rating-value').textContent = this.value;
  });
  
  // Change content
  document.getElementById('change-content')?.addEventListener('click', () => {
    document.getElementById('content-area').textContent =
      'Changed at ' + new Date().toLocaleTimeString();
  });
  
  // Hover
  const hoverEl = document.getElementById('hover-element');
  hoverEl?.addEventListener('mouseenter', () =>
    document.getElementById('hover-message').classList.remove('hidden')
  );
  hoverEl?.addEventListener('mouseleave', () =>
    document.getElementById('hover-message').classList.add('hidden')
  );
  
  // Drag & Drop
  const draggable = document.getElementById('draggable');
  const dropZone = document.getElementById('drop-zone');
  draggable?.addEventListener('dragstart', e =>
    e.dataTransfer.setData('text/plain', e.target.id)
  );
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('bg-gray-200');
  });
  dropZone?.addEventListener('dragleave', () =>
    dropZone.classList.remove('bg-gray-200')
  );
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('bg-gray-200');
    dropZone.textContent = 'Item dropped successfully!';
    dropZone.classList.add('bg-green-100');
  });
  
  // Table row actions
  document.querySelectorAll('.edit-button').forEach(btn =>
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      alert('Edit row ' + row.firstElementChild.textContent);
    })
  );
  document.querySelectorAll('.delete-button').forEach(btn =>
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      if (confirm(`Delete row ${row.firstElementChild.textContent}?`))
        row.remove();
    })
  );
  
  // Iframe content injection
  const iframe = document.getElementById('test-iframe');
  if (iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html><html><head>
        <style>body{font-family:Arial;padding:1rem;background:#f9f9f9}</style>
      </head><body>
        <h3>Iframe Test</h3>
        <button id="iframe-btn" class="px-4 py-2 bg-blue-500 text-white rounded">Click Me</button>
        <script>
          document.getElementById('iframe-btn')
            .addEventListener('click', () => alert('Iframe button!'));
        <\/script>
      </body></html>
    `);
    doc.close();
  }