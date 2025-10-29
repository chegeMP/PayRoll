/**
 * Kenya Statutory Deductions Calculator (Finance Act 2023)
 * Calculates PAYE, NSSF, SHIF, and Housing Levy.
 */

const PERSONAL_RELIEF = 2400.00; // KSh per month

function calculate() {
    const grossSalaryInput = document.getElementById('grossSalary');
    const grossSalary = parseFloat(grossSalaryInput.value);
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error-message');

    // 1. Input Validation
    if (isNaN(grossSalary) || grossSalary <= 0) {
        errorDiv.textContent = "Please enter a valid monthly gross salary.";
        resultsDiv.style.display = 'none';
        return;
    }
    errorDiv.textContent = "";

    // --- 2. Calculate Fixed Statutory Deductions ---

    // A. NSSF (New Rates - Tier 1 & Tier 2)
    // Tier I: 6% of LEL (KSh 6,000) = KSh 360
    // Tier II: 6% of (Pensionable Pay - LEL), capped at UEL (KSh 18,000)
    const LEL = 6000;
    const UEL = 18000;
    const NSSF_RATE = 0.06;

    let tier1 = Math.min(grossSalary, LEL) * NSSF_RATE; // Max 360
    let tier2_salary = Math.max(0, Math.min(grossSalary, UEL) - LEL);
    let tier2 = tier2_salary * NSSF_RATE; // Max (18000-6000)*0.06 = 720
    
    // Total NSSF is Tier I + Tier II, capped at 1080 (360 + 720)
    const NSSF = tier1 + tier2;
    
    // B. Affordable Housing Levy (AHL) - 1.5% of Gross
    const AHL = grossSalary * 0.015;

    // C. Social Health Insurance Fund (SHIF) - 2.75% of Gross
    const SHIF_RATE = 0.0275;
    const SHIF = grossSalary * SHIF_RATE;

    // --- 3. Calculate PAYE (Tax) ---
    
    // NSSF, AHL, and SHIF are deductible before tax (Tax Relief/Exemption)
    const taxableIncome = grossSalary - NSSF - AHL - SHIF;

    let grossTax = 0;
    let incomeLeft = taxableIncome;
    let payeBands = "";
    
    // PAYE Bands (Monthly Rates - Finance Act 2023)
    // Band 1: 10% on the first KSh 24,000
    if (incomeLeft > 0) {
        let band1_amount = Math.min(incomeLeft, 24000);
        grossTax += band1_amount * 0.10;
        incomeLeft -= band1_amount;
        if(band1_amount > 0) payeBands += `10% on ${formatCurrency(band1_amount)}`;
    }

    // Band 2: 25% on the next KSh 8,333
    if (incomeLeft > 0) {
        let band2_amount = Math.min(incomeLeft, 8333);
        grossTax += band2_amount * 0.25;
        incomeLeft -= band2_amount;
        if(band2_amount > 0) payeBands += ` + 25% on ${formatCurrency(band2_amount)}`;
    }
    
    // Band 3: 30% on the next KSh 467,667
    if (incomeLeft > 0) {
        let band3_amount = Math.min(incomeLeft, 467667);
        grossTax += band3_amount * 0.30;
        incomeLeft -= band3_amount;
        if(band3_amount > 0) payeBands += ` + 30% on ${formatCurrency(band3_amount)}`;
    }
    
    // Band 4: 32.5% on the next KSh 300,000
    if (incomeLeft > 0) {
        let band4_amount = Math.min(incomeLeft, 300000);
        grossTax += band4_amount * 0.325;
        incomeLeft -= band4_amount;
        if(band4_amount > 0) payeBands += ` + 32.5% on ${formatCurrency(band4_amount)}`;
    }
    
    // Band 5: 35% on the remainder (above KSh 800,000)
    if (incomeLeft > 0) {
        let band5_amount = incomeLeft;
        grossTax += band5_amount * 0.35;
        incomeLeft -= band5_amount;
        if(band5_amount > 0) payeBands += ` + 35% on ${formatCurrency(band5_amount)}`;
    }
    
    // Apply Personal Relief
    const PAYE = Math.max(0, grossTax - PERSONAL_RELIEF);
    
    // --- 4. Calculate Totals and Update UI ---

    const totalDeductions = PAYE + NSSF + AHL + SHIF;
    const netPay = grossSalary - totalDeductions;
    
    // Helper function for currency formatting
    function formatCurrency(amount) {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Update the UI elements
    document.getElementById('payeRate').textContent = `(KSh ${formatCurrency(taxableIncome)} Taxable - KSh ${formatCurrency(PERSONAL_RELIEF)} Relief)`;
    document.getElementById('payeAmount').textContent = formatCurrency(PAYE);
    document.getElementById('shifAmount').textContent = formatCurrency(SHIF);
    document.getElementById('ahlAmount').textContent = formatCurrency(AHL);
    document.getElementById('nssfAmount').textContent = formatCurrency(NSSF);
    document.getElementById('totalDeductionsAmount').textContent = formatCurrency(totalDeductions);
    document.getElementById('netPayAmount').textContent = formatCurrency(netPay);
    
    resultsDiv.style.display = 'block';
}

// Ensure the calculate function runs when the input field is changed and 'Enter' is pressed
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('grossSalary');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            calculate();
        }
    });
});