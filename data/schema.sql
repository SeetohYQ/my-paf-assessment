drop database if exists music;

create database music;

use music;

create table users (
	user_id varchar(8) not null,
	username varchar(32) not null,
	primary key (user_id)
);

insert into users(user_id, username) values
	('4d0cae84', 'fred'),
	('26a85b1c', 'barney'),
	('675cee52', 'betty'),
	('27b965f6', 'wilma'),
	('820e8a4d', 'bambam'),
	('fc42a34d', 'pebbles');

create table music_list (
	music_id varchar(8) not null,
    music_url varchar(128) not null,
    lyrics text,
    listening_slots int not null default 3,
    song_title varchar(128) not null,
    country varchar(8) not null,
    primary key (music_id)
);

create table music_listeners (
	music_id varchar(8) not null,
    user_id varchar(8) not null,
    checkout timestamp not null on update current_timestamp,
    listening_status boolean not null default true,
    
    primary key(music_id, user_id),
    constraint fk_music_id foreign key(music_id) references music_list(music_id),
    constraint fk_user_id foreign key(user_id) references users(user_id)
);


