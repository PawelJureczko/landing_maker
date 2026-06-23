CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imie` varchar(120) NOT NULL,
	`kontakt` varchar(200) NOT NULL,
	`branza` varchar(80) NOT NULL,
	`firma` varchar(200),
	`wiadomosc` text,
	`source` varchar(80) NOT NULL DEFAULT 'landing',
	`status` enum('new','contacted','project_sent','revisions','won','lost') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
