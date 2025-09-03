import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { MetadataService } from '../../services/metadata.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'opendq-onboard-db',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressSpinnerModule, InputTextModule, ButtonModule],
  templateUrl: './onboard-db.component.html',
  styleUrls: ['./onboard-db.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardDbComponent {
  private readonly fb = inject(FormBuilder);
  private readonly metadataService = inject(MetadataService);

  protected readonly form = this.fb.group({
    host: ['', Validators.required],
    port: ['', [Validators.required, Validators.pattern('^\\d+$')]],
    username: ['', Validators.required],
    password: ['', Validators.required],
    database: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected async submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set(null);
    this.error.set(null);
    try {
      const result = await this.metadataService.sync(this.form.value);
      this.message.set('Database onboarded successfully!');
    } catch (e: any) {
      this.error.set(e?.error?.message || 'Failed to onboard database.');
    } finally {
      this.loading.set(false);
    }
  }
}
