CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `openId` VARCHAR(64) NOT NULL,
    `name` TEXT NULL,
    `email` VARCHAR(320) NULL,
    `loginMethod` VARCHAR(64) NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastSignedIn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_openId_key`(`openId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo` ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `pacotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `destino` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `duracaoDias` INTEGER NOT NULL,
    `imagem` VARCHAR(191) NULL,
    `destaque` BOOLEAN NOT NULL DEFAULT false,
    `disponivel` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `reservas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `pacoteId` INTEGER NOT NULL,
    `dataViagem` DATETIME(3) NOT NULL,
    `dataReserva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quantidadePessoas` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('pendente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendente',
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reservas_usuarioId_idx`(`usuarioId`),
    INDEX `reservas_pacoteId_idx`(`pacoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reservas` ADD CONSTRAINT `reservas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `reservas` ADD CONSTRAINT `reservas_pacoteId_fkey` FOREIGN KEY (`pacoteId`) REFERENCES `pacotes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
