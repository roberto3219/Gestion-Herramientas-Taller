
  document.getElementById('btnGenerarPDF').addEventListener('click', async () => {
    const res = await fetch('/users/generate-pdfs', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
  });
