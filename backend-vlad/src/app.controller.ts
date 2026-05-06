import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Public()
  @Post('test-report')
  @HttpCode(HttpStatus.OK)
  async receiveTestReport(@Body() body: { status: string }) {
    const { status } = body;
    const isSuccess = status === 'success';
    const reportEmail = process.env.TEST_REPORT_EMAIL || 'albertdesarrolloweb@gmail.com';
    
    const emailHtml = `
      <h2>Peludos Click - Test Report (E2E)</h2>
      <p>El flujo automático diario de verificación de la plataforma (E2E) ha finalizado.</p>
      <p><strong>Resultado Global:</strong> <span style="color: ${isSuccess ? 'green' : 'red'};">${status.toUpperCase()}</span></p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-ES')}</p>
      <p>Revisa la pestaña de Actions en GitHub para más detalles de los pasos ejecutados.</p>
    `;

    try {
      const result = await this.mailService.sendTestReport({
        status,
        recipientEmail: reportEmail,
        htmlContent: emailHtml,
      });
      return result;
    } catch (error) {
      console.error('Failed to send test report email:', error.message);
      return { success: false, error: 'Failed to send email', details: error.message };
    }
  }
} 