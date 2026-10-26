<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('registration_number')->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('sales_vehicle_weight')->default(false);
            $table->string('plan')->default('Free trial');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('role', 20)->default('admin')->after('email');
        });

        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 20);
            $table->string('bill_no', 20);
            $table->date('date');
            $table->string('vehicle_number', 30);
            $table->string('party_name');
            $table->string('material');
            $table->decimal('gross_weight', 12, 3);
            $table->decimal('vehicle_weight', 12, 3)->default(0);
            $table->decimal('net_weight', 12, 3);
            $table->decimal('rate', 12, 2);
            $table->decimal('amount', 14, 2);
            $table->timestamps();

            $table->unique(['company_id', 'type', 'bill_no']);
            $table->index(['company_id', 'type', 'date']);
        });

        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('place')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('vendor_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->decimal('amount', 14, 2);
            $table->date('date');
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('item');
            $table->decimal('amount', 14, 2);
            $table->date('date');
            $table->timestamps();

            $table->index(['company_id', 'date']);
        });

        Schema::create('bill_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->morphs('photoable');
            $table->string('path');
            $table->string('note')->nullable();
            $table->date('date');
            $table->timestamps();
        });

        Schema::create('salary_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('daily_rate', 12, 2);
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('salary_role_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->timestamps();
        });

        // Name, role and rate are copied onto each entry so past salary stays correct
        // after a candidate is deleted or a role's rate changes.
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('candidate_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('role_name');
            $table->date('date');
            $table->decimal('days', 5, 2);
            $table->decimal('rate', 12, 2);
            $table->timestamps();

            $table->index(['company_id', 'date']);
        });

        Schema::create('activation_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->unsignedSmallInteger('days');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activation_codes');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('salary_roles');
        Schema::dropIfExists('bill_photos');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('vendor_entries');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('materials');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn('role');
        });

        Schema::dropIfExists('companies');
    }
};
