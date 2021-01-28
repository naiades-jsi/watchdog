-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 24, 2016 at 03:35 PM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

use watchdog;

-- create table for storing alarms
create table alarms (
  id int auto_increment,
  ts timestamp not null default current_timestamp,
  al_name varchar(255) collate utf8_slovenian_ci not null,
  al_sourceid int(11) not null,
  al_description mediumtext collate utf8_slovenian_ci not null,
  primary key (id)
);

-- create table for storing sources
create table source (
  id int auto_increment,
  ts timestamp not null default current_timestamp,
  so_name varchar(255) not null,
  so_typeid int(11) not null,
  so_config mediumtext not null,
  so_last timestamp not null,
  so_frequency int(11) not null,
  so_last_success timestamp not null,
  primary key (id)
);

-- create table for storing types
create table type (
  id int auto_increment,
  ts timestamp not null default current_timestamp,
  ty_name varchar(255) not null,
  primary key (id)
);
