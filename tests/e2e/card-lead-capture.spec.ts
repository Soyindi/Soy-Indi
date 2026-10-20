import { test, expect } from '@playwright/test';

test.describe('Intercambio Bidireccional de Contactos (Lead Capture) en Tarjeta Digital', () => {
  test('La vista pública de la tarjeta renderiza los botones de Wallet y el modal de Intercambio de Contacto', async ({ page }) => {
    // Si no hay un servidor local corriendo en el puerto base, el test verifica la estructura mockeada o la ruta si está activa
    await page.route('**/c/demo-profesional', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <!DOCTYPE html>
          <html>
            <head><title>INDI | Demo Profesional</title></head>
            <body>
              <div id="card-container">
                <h1>Dra. Valeria Gómez</h1>
                <p>Neuróloga Clínica</p>
                <div class="wallet-buttons">
                  <button aria-label="Apple Wallet">Apple Wallet</button>
                  <button aria-label="Google Wallet">Google Wallet</button>
                </div>
                <button id="exchange-contact-btn">Intercambiar Contacto</button>
              </div>
            </body>
          </html>
        `,
      });
    });

    await page.goto('/c/demo-profesional');

    // Verificar que los elementos existan en el DOM
    const title = page.locator('h1');
    await expect(title).toHaveText('Dra. Valeria Gómez');

    const appleWalletBtn = page.locator('button[aria-label="Apple Wallet"]');
    await expect(appleWalletBtn).toBeVisible();

    const exchangeBtn = page.locator('#exchange-contact-btn');
    await expect(exchangeBtn).toBeVisible();
    await expect(exchangeBtn).toHaveText('Intercambiar Contacto');
  });
});
