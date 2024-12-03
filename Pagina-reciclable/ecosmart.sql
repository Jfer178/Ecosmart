-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2024 a las 03:56:09
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ecosmart`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactanos`
--

CREATE TABLE `contactanos` (
  `IdContacto` int(11) NOT NULL,
  `Nombre` varchar(80) NOT NULL,
  `Correo` varchar(80) NOT NULL,
  `idUsuario_FK` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material`
--

CREATE TABLE `material` (
  `idMaterial` int(11) NOT NULL,
  `Nombre` varchar(60) NOT NULL,
  `Categoria` enum('VIDRIO','COBRE','CARTON','PLASTICO','BATERIAS','ALUMINIO','DISPOSITIVOS ELECTRICOS','MADERA','PINTURAS','PAPEL') NOT NULL,
  `Unidad_Medida` enum('Kg') NOT NULL,
  `CantidadMat` varchar(50) NOT NULL,
  `idRecolecta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `material`
--

INSERT INTO `material` (`idMaterial`, `Nombre`, `Categoria`, `Unidad_Medida`, `CantidadMat`, `idRecolecta`) VALUES
(1, 'Baterías', 'BATERIAS', 'Kg', '2', 2),
(2, 'Cobre', 'COBRE', 'Kg', '10', 2),
(3, 'Madera', 'MADERA', 'Kg', '1', 2),
(4, 'Vidrio', 'VIDRIO', 'Kg', '2', 2),
(5, 'Papel', '', 'Kg', '1', 2),
(6, 'Plástico', 'PLASTICO', 'Kg', '1', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recolecta`
--

CREATE TABLE `recolecta` (
  `idRecolecta` int(11) NOT NULL,
  `Direccion` varchar(100) NOT NULL,
  `Material` varchar(50) NOT NULL,
  `CantidadMaterial` int(11) NOT NULL,
  `FechaRecoleccion` int(11) NOT NULL,
  `Cod_Recolecta` varchar(100) NOT NULL,
  `Estado` enum('Pendiente','En Proceso','Completada','Cancelada') NOT NULL,
  `idUsuario_FK` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `recolecta`
--

INSERT INTO `recolecta` (`idRecolecta`, `Direccion`, `Material`, `CantidadMaterial`, `FechaRecoleccion`, `Cod_Recolecta`, `Estado`, `idUsuario_FK`) VALUES
(1, 'KARLA@GMAIL.COM', 'Baterías, Cobre, Madera, Vidrio, Papel, Plástico', 6, 2024, 'R281', 'Pendiente', 1042249887),
(2, 'KARLA@GMAIL.COM', 'Baterías, Cobre, Madera, Vidrio, Papel, Plástico', 17, 2024, 'R858', 'Pendiente', 1042249887);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Correo` varchar(100) NOT NULL,
  `Contraseña` varchar(60) NOT NULL,
  `FechaRegistro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `Nombre`, `Correo`, `Contraseña`, `FechaRegistro`) VALUES
(1042248087, 'Jeremy Fontalvo', 'jeremyazzfontalvomunera@gmail.com', 'scrypt:32768:8:1$ujJtmXINiwvpbmrL$8acf7fbed3aadb5ffd17cd4c1c', '2024-12-02'),
(1042249887, 'Karla Arias', 'KARLA@GMAIL.COM', 'karlita123', '2024-12-02');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `contactanos`
--
ALTER TABLE `contactanos`
  ADD PRIMARY KEY (`IdContacto`),
  ADD KEY `idUsuario_FK` (`idUsuario_FK`);

--
-- Indices de la tabla `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`idMaterial`),
  ADD KEY `idRecolecta` (`idRecolecta`);

--
-- Indices de la tabla `recolecta`
--
ALTER TABLE `recolecta`
  ADD PRIMARY KEY (`idRecolecta`),
  ADD KEY `idUsuario_FK` (`idUsuario_FK`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `contactanos`
--
ALTER TABLE `contactanos`
  MODIFY `IdContacto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `material`
--
ALTER TABLE `material`
  MODIFY `idMaterial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `recolecta`
--
ALTER TABLE `recolecta`
  MODIFY `idRecolecta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `contactanos`
--
ALTER TABLE `contactanos`
  ADD CONSTRAINT `contactanos_ibfk_1` FOREIGN KEY (`idUsuario_FK`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `material`
--
ALTER TABLE `material`
  ADD CONSTRAINT `material_ibfk_1` FOREIGN KEY (`idRecolecta`) REFERENCES `recolecta` (`idRecolecta`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `recolecta`
--
ALTER TABLE `recolecta`
  ADD CONSTRAINT `recolecta_ibfk_1` FOREIGN KEY (`idUsuario_FK`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
