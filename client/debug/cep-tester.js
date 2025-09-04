// Debug script for testing ViaCEP API with specific CEP
async function testViaCep(cep) {
    // Remove non-numeric characters
    const cleanCep = cep.replace(/\D/g, "");
    
    console.log(`Testing CEP: ${cep}`);
    console.log(`Clean CEP: ${cleanCep}`);
    
    if (cleanCep.length !== 8) {
        console.error(`Error: CEP must have 8 digits. Current length: ${cleanCep.length}`);
        return null;
    }
    
    try {
        console.log(`Making request to ViaCEP API: https://viacep.com.br/ws/${cleanCep}/json/`);
        
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        console.log("Response from ViaCEP API:", data);
        
        if (data.erro === true) {
            console.error("ViaCEP API returned error=true for the CEP");
            return null;
        }
        
        return {
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
        };
    } catch (error) {
        console.error("Error fetching CEP:", error);
        return null;
    }
}

// Test with specific CEP
const testCep = "04849-555";
console.log(`===== TESTING CEP: ${testCep} =====`);
testViaCep(testCep)
    .then(result => {
        console.log("Result:", result);
    })
    .catch(error => {
        console.error("Test failed:", error);
    });

// Also test with another known working CEP for comparison
const knownWorkingCep = "01001-000";  // São Paulo downtown CEP
console.log(`\n===== TESTING KNOWN WORKING CEP: ${knownWorkingCep} =====`);
testViaCep(knownWorkingCep)
    .then(result => {
        console.log("Result:", result);
    })
    .catch(error => {
        console.error("Test failed:", error);
    });
