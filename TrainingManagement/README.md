<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Plantilla para Crear un Microservicio

## Descripción

Esta plantilla te permite crear un microservicio basado en [NestJS](https://nestjs.com/) que incluye un ejemplo de gestión de usuarios. Viene preconfigurada con Prisma como gestor de bases de datos y utiliza una arquitectura hexagonal.

## Cómo Empezar

Clona el repositorio utilizando el método que prefieras.

### Usando HTTP

```bash
git clone https://github.com/UnCompa/microservicio-plantilla
```

### Usando SSH

```bash
git clone git@github.com:UnCompa/microservicio-plantilla.git
```

## Instalación de Dependencias

Al clonar la plantilla, ejecuta el siguiente comando para instalar los paquetes necesarios:

### Usando NPM

```bash
npm install
```

### Usando PNPM

```bash
pnpm install
```

## Creación de Tablas con Prisma

Dado que el proyecto utiliza Prisma como gestor de la base de datos, sigue estos pasos:

```bash
# 1. Inicializar Prisma
$ npx prisma init
# 2. Generar las tablas
$ npx prisma generate
# 3. Crear migraciones
$ npx prisma migrate dev
```

> [!IMPORTANTE]  
> Ejecuta los pasos 1 y 2 para que el proyecto funcione correctamente. Asegúrate de configurar adecuadamente las variables de entorno de tu base de datos local.

### Sincronizar Tablas

Para importar los datos de la tabla, utiliza el siguiente comando:

```bash
# Para importar los datos de la tabla
$ npx prisma db pull
```

Para enviar los cambios en los modelos, ejecuta:

```bash
# Para enviar los cambios en los modelos
$ npx prisma db push
```

## Ejecutar el Proyecto 🚀

Una vez configurados Prisma y las variables de entorno, puedes compilar y ejecutar el proyecto con los siguientes comandos:

### Con NPM

```bash
# Desarrollo
$ npm run start

# Modo watch
$ npm run start:dev

# Construir aplicación
$ npm run build

# Producción
$ npm run start:prod
```

### Con PNPM

```bash
# Desarrollo
$ pnpm run start

# Modo watch
$ pnpm run start:dev

# Construir aplicación
$ pnpm run build

# Producción
$ pnpm run start:prod
```

## Uso de Docker 💿

La plantilla incluye un Dockerfile que permite crear una imagen de tu proyecto:

```bash
docker build -t <nombre-de-imagen> .
```

Para crear un contenedor, utiliza:

```bash
docker run -p 3000:3000 -e DATABASE_URL="postgresql://user:password@host:port/db" --name nombre-contenedor imagen
```

## Arquitectura 💻

La arquitectura se basa en el patrón hexagonal, adaptada para la creación de microservicios.

![Imagen de la arquitectura](https://i.postimg.cc/t4nvmtWh/Slide-16-9-3-1.png)

## Creación de Swagger

El proyecto incluye documentación generada con Swagger. Visita la URL de tu proyecto y navega a _/api_ para acceder a la documentación.

### Exportar a YML

Si deseas exportar la documentación al formato YML, sigue estos pasos:

1. Instala la dependencia:

```bash
npm install js-yaml
```

2. Utiliza la dependencia:

```ts
import * as yaml from 'js-yaml';
import * as fs from 'fs';

// Crea el documento JSON de Swagger
const document = SwaggerModule.createDocument(app, config);

// Convierte el documento JSON a YAML
const yamlDocument = yaml.dump(document);

// Guarda el archivo YAML si es necesario
fs.writeFileSync('./swagger.yml', yamlDocument);
SwaggerModule.setup('api', app, document);
```

## Guía de Uso 🎉

> **NOTA**  
> La guía de uso está basada en pruebas realizadas previamente.

Se explicará de forma general cómo crear un microservicio; en este ejemplo, se abordará la gestión de usuarios.

### Carpetas Clave

Dado que el proyecto sigue una arquitectura hexagonal, hay tres carpetas importantes:

- **domain**: Contiene la definición de las entidades del microservicio, en este caso, la entidad de usuario.
- **application**: Se encarga de crear servicios que se comunican con la capa de dominio.
- **infrastructure**: Maneja los controladores que utilizan los servicios de la capa de aplicación.

### Dominio

A continuación, se muestra cómo luce la entidad del microservicio:

```ts
/* user.entity.ts */
// Definir entidad para la lógica de negocio
export class User {
  id: string;
  name: string;
  email: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
```

> **IMPORTANTE**  
> Dado que el proyecto utiliza Prisma, no se emplea la entidad en sí; se usa el modelo para la creación de entidades. Esta capa sirve como guía para comprender la lógica de negocio.

```prisma
model User {
  id    String @id @default(uuid()) @db.Uuid
  name  String
  email String @unique
}
```

### Aplicación

Aquí se crean los servicios para interactuar con la capa de dominio. Las carpetas incluyen los DTOs, loggers, conexión con Prisma, y el servicio para la entidad. La carpeta del servicio es fundamental, en este caso, la de usuario.

### Infraestructura

En esta capa, se crean los controladores para establecer la comunicación entre el cliente y el servidor, así como el módulo de comunicación.
