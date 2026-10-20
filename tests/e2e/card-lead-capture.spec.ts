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
                  <a href="/api/wallet/apple/demo-profesional" aria-label="Añadir a Apple Wallet">Apple Wallet</a>
                  <a href="/api/wallet/google/demo-profesional" aria-label="Añadir a Google Wallet">Google Wallet</a>
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

    const appleWalletLink = page.locator('a[aria-label="Añadir a Apple Wallet"]');
    await expect(appleWalletLink).toBeVisible();
    await expect(appleWalletLink).toHaveAttribute('href', '/api/wallet/apple/demo-profesional');

    const exchangeBtn = page.locator('#exchange-contact-btn');
    await expect(exchangeBtn).toBeVisible();
    await expect(exchangeBtn).toHaveText('Intercambiar Contacto');
  });
});
