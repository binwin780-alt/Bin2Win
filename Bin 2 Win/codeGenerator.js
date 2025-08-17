function generatePointCode(prefix = '1p') {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${rand}`;
}

function generateSingleCode() {
  const prefix = document.getElementById('codePrefix')?.value || '1p';
  const newCode = generatePointCode(prefix);
  document.getElementById('generatedCodeDisplay').textContent = newCode;

  let usedCodes = JSON.parse(localStorage.getItem("usedCodes")) || [];
  usedCodes.push(newCode);
  localStorage.setItem("usedCodes", JSON.stringify(usedCodes));

  fetch("https://script.google.com/macros/s/AKfycbwhxq0t0ec4iIYAeufWLQCFKS3P7x42dXPlJ412dPGqXkO8KVE8QBwi2q2jVdoDI2-bJg/exec", {
    method: "POST",
    body: new URLSearchParams({
      action: "addCode",
      code: newCode,
      prefix,
      createdBy: "Admin"
    })
  })
  .then(res => res.text())
  .then(txt => console.log("🟢 Server says:", txt))
  .catch(err => console.error("❌ Network error:", err));
}

function copyCode() {
  const code = document.getElementById('generatedCodeDisplay')?.textContent.trim();
  if (!code) return alert("No code to copy.");
  navigator.clipboard.writeText(code)
    .then(() => alert("✅ Code copied!"))
    .catch(() => alert("❌ Copy failed."));
}

function downloadCodesAsTxt() {
  const usedCodes = JSON.parse(localStorage.getItem("usedCodes")) || [];
  if (!usedCodes.length) return alert("No codes to export yet.");
  const blob = new Blob(["List of Used Codes\n=================\n" + usedCodes.join('\n')], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Bin2Win_Codes.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
