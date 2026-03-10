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
    const emailHtml = `
      <h2>Peludos Click - Test Report (E2E)</h2>
      <p>El flujo automático diario de verificación de la plataforma (E2E) ha finalizado.</p>
      <p><strong>Resultado Global:</strong> <span style="color: ${isSuccess ? 'green' : 'red'};">${status.toUpperCase()}</span></p>
      <p>Revisa la pestaña de Actions en GitHub para más detalles de los pasos ejecutados.</p>
    `;

    // We cast to access the underlying mailerService since it's private in MailService
    try {
      await this.mailService['mailerService'].sendMail({
        to: 'albertdesarrolloweb@gmail.com',
        from: '"Peludos Click Bot" <no-reply@peludosclick.com>',
        subject: `[Peludos Click] Reporte Diario de Testing E2E - ${status.toUpperCase()}`,
        html: emailHtml,
      });
      return { success: true, message: 'Report email sent successfully' };
    } catch (error) {
      console.error('Failed to send test report email:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }
} 