const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeId(value) {
  return String(value == null ? "" : value)
    .trim()
    .replace(/[^0-9a-zA-Z֐-׿]/g, "")
    .replace(/^0+(?=\d)/, "")
    .toLowerCase();
}

function normalizeText(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[^0-9a-zA-Z֐-׿\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(left, right) {
  const a = normalizeId(left);
  const b = normalizeId(right);
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }
  return matrix[a.length][b.length];
}

function amountDifference(invoice, book) {
  const invoiceAmounts = [invoice.total, invoice.amount].map(Number).filter(Number.isFinite);
  const bookAmounts = [book.record_schum, book.schum_hova, book.schum_zchut]
    .map(Number)
    .filter(Number.isFinite)
    .map(Math.abs);
  if (!invoiceAmounts.length || !bookAmounts.length) return null;
  const differences = [];
  invoiceAmounts.forEach(invoiceAmount => {
    bookAmounts.forEach(bookAmount => differences.push(Math.abs(invoiceAmount - bookAmount)));
  });
  return Math.min.apply(null, differences);
}

function dateDifference(left, right) {
  const a = new Date(left);
  const b = new Date(right);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.round(Math.abs(a.getTime() - b.getTime()) / DAY_MS);
}

function textOverlap(invoice, book) {
  const invoiceWords = normalizeText([invoice.supplier, invoice.description, invoice.project].join(" "))
    .split(" ")
    .filter(word => word.length > 1);
  const bookWords = new Set(
    normalizeText([book.cust_lname, book.pratim, book.bs_item_name].join(" "))
      .split(" ")
      .filter(word => word.length > 1)
  );
  if (!invoiceWords.length || !bookWords.size) return 0;
  return invoiceWords.filter(word => bookWords.has(word)).length / invoiceWords.length;
}

export function scoreBookCandidate(invoice, book) {
  let score = 0;
  const reasons = [];
  const invoiceId = normalizeId(invoice.invoiceId);
  const bookId = normalizeId(book.asmacta1);

  if (invoiceId && bookId) {
    const distance = editDistance(invoiceId, bookId);
    if (invoiceId === bookId) {
      score += 100;
      reasons.push("exact invoice number");
    } else if (distance === 1) {
      score += 65;
      reasons.push("invoice number differs by one character");
    } else if (invoiceId.includes(bookId) || bookId.includes(invoiceId)) {
      score += 55;
      reasons.push("one invoice number contains the other");
    } else if (distance === 2 && Math.max(invoiceId.length, bookId.length) >= 5) {
      score += 35;
      reasons.push("invoice number differs by two characters");
    }
  }

  const amountDiff = amountDifference(invoice, book);
  if (amountDiff === 0) {
    score += 45;
    reasons.push("exact amount");
  } else if (amountDiff != null && amountDiff <= 1) {
    score += 35;
    reasons.push(`amount difference ${amountDiff.toFixed(2)}`);
  } else if (amountDiff != null && amountDiff <= 10) {
    score += 15;
    reasons.push(`amount difference ${amountDiff.toFixed(2)}`);
  }

  const days = dateDifference(invoice.date, book.asmchta_date);
  if (days === 0) {
    score += 30;
    reasons.push("same date");
  } else if (days != null && days <= 3) {
    score += 20;
    reasons.push(`date difference ${days} day${days === 1 ? "" : "s"}`);
  } else if (days != null && days <= 7) {
    score += 10;
    reasons.push(`date difference ${days} days`);
  }

  const overlap = textOverlap(invoice, book);
  if (overlap >= 0.5) {
    score += 20;
    reasons.push("strong text similarity");
  } else if (overlap > 0) {
    score += 8;
    reasons.push("some matching text");
  }

  return { book, score, reasons };
}

