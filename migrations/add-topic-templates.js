const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { info, error } = require('../src/logger');

const { connect, close } = require('../src/utils/database');

const School = require('../src/services/school/model').schoolModel;
const Course = require('../src/services/user-group/model').courseModel;
const Topic = require('../src/services/lesson/model');

// How to use more than one schema per collection on mongodb
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb

module.exports = {
	up: async function up() {
		await connect();

		const templateSchool = new School({
			name: "Template Schule"
		});
		await templateSchool.save();
		logger.info('Template School was successfully created');

		const templateCourse = new Course({
			schoolId: templateSchool._id,
			name: "Template Kurs"
		});
		await templateCourse.save();
		logger.info('Template Course in "Template Schule" was successfully created');

		await Topic.create([
			{
				"_id" : ObjectId("5dc53f60b57c64003860bf39"),
				"updatedAt" : ISODate("2019-11-08T11:02:15.788+0000"),
				"createdAt" : ISODate("2019-01-15T16:30:09.566+0000"),
				"name" : "neXboard als Mindmap",
				"time" : ISODate("2019-11-07T23:00:00.000+0000"),
				"date" : ISODate("1999-12-31T23:00:00.000+0000"),
				"__v" : NumberInt(0),
				"courseId" : templateCourse._id,
				"position" : NumberInt(1),
				"isCopyFrom" : ObjectId("5d8c6fafdaeb73001a25ac23"),
				"hidden" : false,
				"materialIds" : [

				],
				"contents" : [
					{
						"_id" : ObjectId("5dc54b3768ef9600366d7f09"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Nutzungshinweise: </span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Achtung: Tausche die im Template enthaltenen Tools (z.B. neXboard, Etherpad, GeoGebra) nachträglich manuell aus, da Änderungen daran sich sonst auf den Original-Kurs auswirken! Dateien (Bilder, Videos, Audio) sowie verlinktes Material sind nicht betroffen und können unverändert bleiben.</span></p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Anleitung (Bitte vor dem Unterrichtseinsatz löschen!)"
					},
					{
						"_id" : ObjectId("5dc54b3768ef9600366d7f08"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Hinweise für Lehrkräfte:</span><br />\r\nDas neXboard eignet sich gut dafür, <strong>Mind Maps</strong> gemeinsam mit den SuS zu erstellen.</h2>\r\n\r\n<p><span class=\"marker\">Mind Maps ermöglichen das <strong>kreative Erschließen neuer Gedanken</strong> <strong>und Ideen</strong> zu einem übergeordneten Thema und zeigen so neue Aspekte zu Problemen auf.</span></p>\r\n\r\n<p>Durch die gute Übersichtlichkeit werden oft weitaus mehr Ideen gefunden, als durch das gemeinsame mündliche Zusammentragen. Auch werden Informationen wesentlich schneller zusammengetragen, da alle Teilnehmer gleichzeitig ihr Ideen äußern können.</p>\r\n\r\n<div style=\"background:#eeeeee;border:1px solid #cccccc;padding:5px 10px;\">Schauen wir uns das Prinzip an folgendem Beispiel zum Thema \"Probleme der Globalisierung\" an:</div>\r\n\r\n<div style=\"background:#eeeeee;border:1px solid #cccccc;padding:5px 10px;\"><img alt src=\"/files/file?file=5d8c6fafdaeb73001a25ac24\" style=\"height:808px;width:2354px;\" /></div>\r\n"
						},
						"user" : ObjectId("59ad4c412b442b7f81810285"),
						"component" : "text",
						"hidden" : false,
						"title" : "Kollaborative Gedankenkarten"
					},
					{
						"_id" : ObjectId("5dc54b3768ef9600366d7f07"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Nutzungshinweise: </span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Achtung: Tausche die im Template enthaltenen Tools (z.B. neXboard, Etherpad, GeoGebra) nachträglich manuell aus, da Änderungen daran sich sonst auf den Original-Kurs auswirken! Dateien (Bilder, Videos, Audio) sowie verlinktes Material sind nicht betroffen und können unverändert bleiben.</span></p>\r\n"
						},
						"user" : ObjectId("59ad4c412b442b7f81810285"),
						"component" : "text",
						"hidden" : false,
						"title" : ""
					},
					{
						"_id" : ObjectId("5dc54b3768ef9600366d7f06"),
						"content" : {
							"title" : "Vorlage",
							"description" : "",
							"board" : "17921",
							"url" : "https://nexboard.nexenio.com/app/client/pub/17921/222h3999-p464-7uj7-j8e4-1000ip725643"
						},
						"user" : ObjectId("5d8b60aeb797000019a7259a"),
						"component" : "neXboard",
						"hidden" : false,
						"title" : ""
					}
				]
			}
			{
				"_id" : ObjectId("5dc53f9eb57c64003860bf3b"),
				"updatedAt" : ISODate("2019-11-08T10:57:22.386+0000"),
				"createdAt" : ISODate("2019-09-30T09:22:17.966+0000"),
				"name" : "Story-Telling (Hörspiel-Episoden) mit Beispiel [Arbeitsphase]",
				"time" : ISODate("2019-11-07T23:00:00.000+0000"),
				"date" : ISODate("1999-12-31T23:00:00.000+0000"),
				"__v" : NumberInt(0),
				"courseId" : templateCourse._id,
				"position" : NumberInt(6),
				"isCopyFrom" : ObjectId("5dc2de236f1766002d0891fb"),
				"hidden" : false,
				"materialIds" : [

				],
				"contents" : [
					{
						"_id" : ObjectId("5dc54a121e7b1a0039ff049c"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Nutzungshinweise: </span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Achtung: Tausche die im Template enthaltenen Tools (z.B. neXboard, Etherpad, GeoGebra) nachträglich manuell aus, da Änderungen daran sich sonst auf den Original-Kurs auswirken! Dateien (Bilder, Videos, Audio) sowie verlinktes Material sind nicht betroffen und können unverändert bleiben.</span><br />\r\n<span style=\"background-color:#e67e22;\">Nutzungsrechtlicher Hinweis zu den verwendeten Medien: Quelle: </span><a href=\"https://www.ardaudiothek.de/geschichten-aus-sachsen-anhalt/35830792\"><span style=\"background-color:#e67e22;\">https://www.ardaudiothek.de/geschichten-aus-sachsen-anhalt/35830792</span></a><span style=\"background-color:#e67e22;\">; es gelten die dort angegebenen bzw. generellen Urheberrechtsbestimmungen</span></p>\r\n\r\n<h2><span style=\"background-color:#e67e22;\">Pädagogisch/didaktischer Einsatzvorschlag: Arbeitsphase</span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">In diesem Template wird vorgeschlagen, wie immersive Medien (Audio) zusammengestellt werden können, um in der Schul-Cloud eine Art Story-Telling zu verwirklichen. Aspekte wie die Geschichte des Landes, historische Personen und Orientierung im Raum spielen dort hinein und könnten inhaltlich durch \"die Entwicklung vom Dann zum Jetzt\" sowie ggf. durch vort Ort Termine erweitert werden.</span></p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Anleitung (Bitte vor dem Unterrichtseinsatz löschen!)"
					},
					{
						"_id" : ObjectId("5dc54a121e7b1a0039ff049b"),
						"content" : {
							"text" : "<p>Ein Land kennenzulernen, bedeutet auch seine Geschichte und Orte kennenzulernen. Anhand ausgewählter Episoden in unterschiedlichen Epochen und Gegenden Sachsen-Anhalts lernen wir das Land kennen.</p>\r\n\r\n<h3 style=\"color:#aaaaaa;font-style:italic;\"><img alt=\"Von Ulamm 15:49, 19 February 2008 (UTC) - http://www.maps-for-free.com, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3582086\" src=\"/files/file?file=5dc53f9eb57c64003860bf3c&name=Sachsen-Anhalt.gif\" style=\"height:708px;width:600px;\" /><br />\r\nVon Ulamm 15:49, 19 February 2008 (UTC) - http://www.maps-for-free.com, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=3582086</h3>\r\n\r\n<h3 style=\"color:#aaaaaa;font-style:italic;\">Audio-Quellen: Copyright mdr/ARDAudiothek</h3>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Story-Navigation (Karte von Sachsen-Anhalt)"
					},
					{
						"_id" : ObjectId("5dc54a121e7b1a0039ff049a"),
						"content" : {
							"text" : "<h3>Das Panoramamuseum in Bad Frankenhausen</h3>\r\n\r\n<p>Vor 30 Jahren wurde in Bad Frankenhausen das Bauernkriegs-Panaroma des Leipziger Malers und Kunstprofessors Werner Tübke eröffnet. Theo M. Lies kennt die Geschichte dahinter.<br />\r\n </p>\r\n\r\n<div class=\"ckeditor-html5-audio\" style=\"text-align:left;float:left;margin-right:10px;\">\r\n<audio controls=\"controls\" src=\"/files/file?file=5dc53f9eb57c64003860bf3f&name=digas-79242d0f-8f1f-4081-917d-0b63a627d192-69c30f9eac0b_79.mp3\"> </audio>\r\n</div>\r\n\r\n<p> </p>\r\n\r\n<p> </p>\r\n\r\n<p> </p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Episode 1"
					},
					{
						"_id" : ObjectId("5dc54a121e7b1a0039ff0499"),
						"content" : {
							"text" : "<h3>GutsMuths - der Turnvater</h3>\r\n\r\n<p>Quedlinburg ist nicht nur eine hübsche Fachwerkstadt im Harz, von hier stammen auch berühmte Persönlichkeiten, wie GutsMuths. Er hatte Ende des 18. Jahrhunderts erstmals Gymnastik in den Schulplan integriert.</p>\r\n\r\n<div class=\"ckeditor-html5-audio\" style=\"text-align:left;float:left;margin-right:10px;\">\r\n<audio controls=\"controls\" src=\"/files/file?file=5dc53f9eb57c64003860bf40&name=digas-a1d7ff80-bee5-4390-953b-da8fb245d49f-69c30f9eac0b_a1.mp3\"> </audio>\r\n</div>\r\n\r\n<p> </p>\r\n\r\n<p> </p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Episode 2"
					},
					{
						"_id" : ObjectId("5dc54a121e7b1a0039ff0498"),
						"content" : {
							"text" : "<h3>70 Jahre \"Kleine weiße Friedenstaube\"</h3>\r\n\r\n<p>Seit mehr als sieben Jahrzehnten gibt es das Lied \"Kleine weiße Friedenstaube\". Auch in Sachsen-Anhalt lebt das Lied weiter. Susanne Reh über die Geschichte, die hinter dem Song steckt.</p>\r\n\r\n<div class=\"ckeditor-html5-audio\" style=\"text-align:left;float:left;margin-right:10px;\">\r\n<audio controls=\"controls\" src=\"/files/file?file=5dc53f9eb57c64003860bf3e&name=digas-9c7abba2-9e35-48b1-84c5-0eeddb8ccc8d-69c30f9eac0b_9c.mp3\"> </audio>\r\n</div>\r\n\r\n<p> </p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Episode 3"
					},
					{
						"_id" : ObjectId("5dc54a121e7b1a0039ff0497"),
						"content" : {
							"text" : "<h3>Eröffnung Bauhaus-Museum Dessau</h3>\r\n\r\n<p>Die Geburtstage der Bauhaus-Meister wurden immer sehr zelebriert. Legendär sind die Feste, die oft und ausschweifend gefeiert werden. Susanne Reh kramt in der Erinnerungskiste.</p>\r\n\r\n<div class=\"ckeditor-html5-audio\" style=\"text-align:left;float:left;margin-right:10px;\">\r\n<audio controls=\"controls\" src=\"/files/file?file=5dc53f9eb57c64003860bf3d&name=digas-ecf3e823-39b0-42f4-ab6c-42e7e38a5bc6-69c30f9eac0b_ec.mp3\"> </audio>\r\n</div>\r\n\r\n<p> </p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Episode 4"
					}
				]
			}
			{
				"_id" : ObjectId("5dc541f71e7b1a0039ff0469"),
				"updatedAt" : ISODate("2019-11-08T10:51:02.538+0000"),
				"createdAt" : ISODate("2019-09-30T08:56:04.950+0000"),
				"name" : "Klimawandel [immersiver Einstieg]",
				"time" : ISODate("2019-11-07T23:00:00.000+0000"),
				"date" : ISODate("1999-12-31T23:00:00.000+0000"),
				"__v" : NumberInt(0),
				"courseId" : templateCourse._id,
				"position" : NumberInt(1),
				"isCopyFrom" : ObjectId("5dc165a2a427aa0031467a40"),
				"hidden" : false,
				"materialIds" : [

				],
				"contents" : [
					{
						"_id" : ObjectId("5dc5489668ef9600366d7eff"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Nutzungshinweise: </span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Achtung: Tausche die im Template enthaltenen Tools (z.B. neXboard, Etherpad, GeoGebra) nachträglich manuell aus, da Änderungen daran sich sonst auf den Original-Kurs auswirken! Dateien (Bilder, Videos, Audio) sowie verlinktes Material sind nicht betroffen und können unverändert bleiben.<br />\r\nNutzungsrechtlicher Hinweis zum Video: es handelt sich ausdrücklich um ein der HPI Schul-Cloud bereitgestelltes, rechtlich nicht für die Nutzung außerhalb der Schul-Cloud freigegebenes Medienelement. Darüber hinaus gelten die im Vorspann des Videos angebenen Nutzungsbedingungen.</span></p>\r\n\r\n<h2><span style=\"background-color:#e67e22;\">Pädagogisch/didaktischer Einsatzvorschlag: Informierender Einstieg</span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Immersive Medien (hier im Beispiel ein Video) sind bestens geeignet, ein Thema zu beginnen. Durch mediale Wirkung ist es leichter, Lernende und ihre Aufmerksamkeit emotional zu erreichen. Besonders effektiv erscheint es etwa, die entstehende thematische Bindung mit einer Aufnahme der ersten, gemeinsamen Reaktion der Lernenden auf das Thema zu koppeln. Daher ist in diesem Template vorgeschlagen, nach der Videoansicht mit der gemeinsamen Feedback-Sammlung in einem Etherpad weiterzumachen.<br />\r\n(Alternativ gibt es auch das gleiche Template gekoppelt mit neXboard.<br />\r\nDaran lässt sich wunderbar die Arbeitsphase anschließen.</span></p>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Mediendidaktischer Hinweis: Das Video ist professionell vor ein paar Jahren bereits produziert worden. Grundlegende Aussagen gelten sicherlich, die Frage der Aktualität kann aber auch wunderbar im Rahmen des KMK - Medienkompetenzbereichs \"Analysieren und Reflektieren\" diskutiert werden und - je nach Lerngruppe - z. B. in der unten vorgeschlagenen Weise behandelt werden. Vorteil: wenn Ihr das mit Rechercheaufgaben verbindet, lässt sich der Weg zu einem gemeinsamen Werk gut speichern und immer wieder aufrufen.</span></p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Anleitung (Bitte vor dem Unterrichtseinsatz löschen!)"
					},
					{
						"_id" : ObjectId("5dc5489668ef9600366d7efe"),
						"content" : {
							"text" : "<div class=\"ckeditor-html5-video\" style=\"text-align:left;float:left;margin-right:10px;\">\r\n<video controls=\"controls\" src=\"https://sc-content-resources.schul-cloud.org/5558485_Verwundeter_planet_2/varianten/de/video/5558099-Verwundeter_Planet_II.mp4\"> </video>\r\n</div>\r\n\r\n<p> </p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Immersives Video"
					},
					{
						"_id" : ObjectId("5dc5489668ef9600366d7efd"),
						"content" : {
							"title" : "Reaktionen zum Film",
							"description" : "Welche Probleme stellt der Film dar? In welchen Punkten seid Ihr anderer Meinung? ...",
							"url" : "https://etherpad.schul-cloud.org/p/y3zke"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "Etherpad",
						"hidden" : false,
						"title" : "Reaktionen zum Film"
					},
					{
						"_id" : ObjectId("5dc5489668ef9600366d7efc"),
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "resources",
						"hidden" : false,
						"title" : ""
					}
				]
			}
			{
				"_id" : ObjectId("5dc542101e7b1a0039ff046b"),
				"updatedAt" : ISODate("2019-11-08T12:12:30.491+0000"),
				"createdAt" : ISODate("2019-09-30T08:56:04.950+0000"),
				"name" : "Klimawandel [Arbeitsphase]",
				"time" : ISODate("2019-11-07T23:00:00.000+0000"),
				"date" : ISODate("1999-12-31T23:00:00.000+0000"),
				"__v" : NumberInt(0),
				"courseId" : templateCourse._id,
				"position" : NumberInt(1),
				"isCopyFrom" : ObjectId("5dc425e7c625d2002c1a1d69"),
				"hidden" : false,
				"materialIds" : [

				],
				"contents" : [
					{
						"_id" : ObjectId("5dc55bae68ef9600366d7f24"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Nutzungshinweise: </span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Achtung: Tausche die im Template enthaltenen Tools (z.B. neXboard, Etherpad, GeoGebra) nachträglich manuell aus, da Änderungen daran sich sonst auf den Original-Kurs auswirken! Dateien (Bilder, Videos, Audio) sowie verlinktes Material sind nicht betroffen und können unverändert bleiben.<br />\r\nNutzungsrechtlicher Hinweis zum Video: es handelt sich ausdrücklich um ein der HPI Schul-Cloud bereitgestelltes, rechtlich nicht für die Nutzung außerhalb der Schul-Cloud freigegebenes Medienelement. Darüber hinaus gelten die im Vorspann des Videos angebenen Nutzungsbedingungen.</span></p>\r\n\r\n<h2><span style=\"background-color:#e67e22;\">Pädagogisch/didaktischer Einsatzvorschlag: Arbeitsphase</span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">In diesem Template wird vorgeschlagen, wie Mediennutzung, Medienbewertung sowie Medienauswahl in der Schul-Cloud miteinander verbunden werden können. Dazu wird das bereits in einem anderen Template eingesetzte Video erneut verwendet, um Lerngruppen verteilte Aufgaben zu geben. Es wird verwiesen auf Medienelemente des \"Klimawandel-Wiki\"-Bereiches des Bildungsservers (</span><a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite\" target=\"_blank\"><span style=\"background-color:#e67e22;\">http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite</span></a><span style=\"background-color:#e67e22;\">). Die hier beispielhaft erwähnten Materialien sind von dort unter freien Lizenzen nutzbar, die in ihrer jeweils aktuellen Fassung </span><a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite\" target=\"_blank\"><span style=\"background-color:#e67e22;\">hier</span></a><span style=\"background-color:#e67e22;\"> nachzulesen sind. Aus technischen Gründen lassen sich Aufgaben derzeit nicht mit den Templates verteilen, daher lies bitte alles über Aufgabenstellung in der Schul-Cloud im </span><a href=\"/help#Unterricht\"><span style=\"background-color:#e67e22;\">Hilfebereich unter \"Aufgaben\" nach</span></a><span style=\"background-color:#e67e22;\">. Es ist recht einfach!</span></p>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Das hier anvisierte Unterrichtsziel resultiert in einer gemeinsamen Diskussion und Zusammenstellung der Ergebnisse. Auch hierfür bieten sich die Tools \"etherpad\" sowie alternativ \"nexBoard\" an. Einfach mal ausprobieren. Bei einem Misslingen der Probe: einfach das Template erneut verwenden!</span></p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Anleitung (Bitte vor dem Unterrichtseinsatz löschen!)"
					},
					{
						"_id" : ObjectId("5dc55bae68ef9600366d7f23"),
						"content" : {
							"text" : "<div class=\"ckeditor-html5-video\" style=\"text-align:left;float:left;margin-right:10px;\">\r\n<video controls=\"controls\" src=\"https://sc-content-resources.schul-cloud.org/5558485_Verwundeter_planet_2/varianten/de/video/5558099-Verwundeter_Planet_II.mp4\"> </video>\r\n</div>\r\n\r\n<p> </p>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Immersives Video"
					},
					{
						"_id" : ObjectId("5dc55bae68ef9600366d7f22"),
						"content" : {
							"text" : "<h3><strong>Gruppe 1:</strong></h3>\r\n\r\n<p>Bitte seht Euch das Video ab dem Zeitpunkt 2:15min an. Danach geht zur Site \"<a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite\">http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite</a>\" nach dem Begriff \"Regenwald\", lest den Text und folgt, wenn das interessant klingt gerne den direkt von dieser Seite abgehenden Links (nur denen!!).<br />\r\nSucht Euch auf der Seite eines der angezeiten Bilder aus, dass das im Text geschilderte Problem am besten darstellt. Solltest Du/Ihr auf der Seite kein gutes Bild finden, probiert die Bildersammlung unter <a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Kategorie:Bildergalerien\">http://wiki.bildungsserver.de/klimawandel/index.php/Kategorie:Bildergalerien</a> aus, und wählt dort ensprechend ein Bild aus. Einigt Euch in der Gruppe, welches Bild Ihr auswählt!<br />\r\n<strong>Sammelt Eure Argumente für dieses Bild: wir werden das danach in großer Runde jeweils vorstellen!</strong> </p>\r\n\r\n<h3><strong>Gruppe 2:</strong></h3>\r\n\r\n<p>Bitte seht Euch das Video ab dem Zeitpunkt 3:44min an. Danach geht zur Site \"<a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite\">http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite</a>\" nach dem Begriff \"Artensterben\", lest den Text und folgt, wenn das interessant klingt gerne den direkt von dieser Seite abgehenden Links (nur denen!!).<br />\r\nSucht Euch auf der Seite eines der angezeiten Bilder aus, dass das im Video und im Text geschilderte Problem am besten darstellt. Solltest Du/Ihr auf der Seite kein gutes Bild finden, probiert die Bildersammlung unter <a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Kategorie:Bildergalerien\">http://wiki.bildungsserver.de/klimawandel/index.php/Kategorie:Bildergalerien</a> aus, und wählt dort ensprechend ein Bild aus. Einigt Euch in der Gruppe, welches Bild Ihr auswählt!<br />\r\n<strong>Sammelt Eure Argumente für dieses Bild: wir werden das danach in großer Runde jeweils vorstellen!</strong></p>\r\n\r\n<h3><strong>Gruppe 3:</strong></h3>\r\n\r\n<p>Bitte seht Euch das Video ab dem Zeitpunkt 7:30min an. Danach geht zur Site \"<a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite\">http://wiki.bildungsserver.de/klimawandel/index.php/Hauptseite</a>\" nach dem Begriff \"Klimaänderungen in Hamburg\"\", lest den Text und folgt, wenn das interessant klingt gerne den direkt von dieser Seite abgehenden Links (nur denen!!).<br />\r\nSucht Euch auf der Seite eines der angezeiten Bilder aus, dass das im Video und im Text geschilderte Problem am besten darstellt. Solltest Du/Ihr auf der Seite kein gutes Bild finden, probiert die Bildersammlung unter <a href=\"http://wiki.bildungsserver.de/klimawandel/index.php/Kategorie:Bildergalerien\">http://wiki.bildungsserver.de/klimawandel/index.php/Kategorie:Bildergalerien</a> aus, und wählt dort ensprechend ein Bild aus. Einigt Euch in der Gruppe, welches Bild Ihr auswählt!<br />\r\n<strong>Sammelt Eure Argumente für dieses Bild: wir werden das danach in großer Runde jeweils vorstellen!</strong></p>\r\n\r\n<p><strong><span style=\"background-color:#e67e22;\">USW.!!</span></strong></p>\r\n\r\n<h3> </h3>\r\n"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "text",
						"hidden" : false,
						"title" : "Aufgabenstellung (Gruppenarbeit)"
					},
					{
						"_id" : ObjectId("5dc55bae68ef9600366d7f21"),
						"content" : {
							"title" : "Reaktionen zum Film",
							"description" : "Welche Probleme stellt der Film dar? In welchen Punkten seid Ihr anderer Meinung? ...",
							"url" : "https://etherpad.schul-cloud.org/p/y3zke"
						},
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "Etherpad",
						"hidden" : false,
						"title" : "Ergebnissortierung"
					},
					{
						"_id" : ObjectId("5dc55bae68ef9600366d7f20"),
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"component" : "resources",
						"hidden" : false,
						"title" : ""
					}
				]
			}
			{
				"_id" : ObjectId("5dc542391e7b1a0039ff046c"),
				"updatedAt" : ISODate("2019-11-08T10:23:54.187+0000"),
				"createdAt" : ISODate("2019-11-06T11:10:06.350+0000"),
				"name" : "Klimawandel und Demokratie [Arbeits- und Ergebnissicherungsphase]",
				"time" : ISODate("2019-11-07T23:00:00.000+0000"),
				"date" : ISODate("1999-12-31T23:00:00.000+0000"),
				"__v" : NumberInt(0),
				"courseId" : templateCourse._id,
				"position" : NumberInt(3),
				"isCopyFrom" : ObjectId("5dc2aa0ec4b99c002c74328b"),
				"hidden" : false,
				"materialIds" : [

				],
				"contents" : [
					{
						"title" : "Anleitung (Bitte vor dem Unterrichtseinsatz löschen!)",
						"hidden" : false,
						"component" : "text",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"text" : "<h2><span style=\"background-color:#e67e22;\">Nutzungshinweise: </span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">Achtung: Tausche die im Template enthaltene Tools (z.B. nexBoard, Etherpad, GeoGebra) nachträglich manuell aus, da Änderungen daran sich sonst auf den Original-Kurs auswirken! Dateien (Bilder, Videos, Audio) sowie verlinktes Material sind nicht betroffen und können unverändert bleiben.</span><br />\r\n<span style=\"background-color:#e67e22;\">Nutzungsrechtlicher Hinweis zum Material: die Nutzungsrechte unterliegen den Bestimmungen der verlinkten Site (https://www.bpb.de). </span></p>\r\n\r\n<h2><span style=\"background-color:#e67e22;\">Pädagogisch/didaktischer Einsatzvorschlag: Arbeitsphase</span></h2>\r\n\r\n<p><span style=\"background-color:#e67e22;\">In diesem Template wird gezeigt, wie nützlich QRCodes für einen reibungslosen Unterrichtsverlauf mit digitalen Mittel sein können. Die inhaltliche Idee ist natürlich, dass die Lernenden ihr durch die Materialien des BPB erworbenes Wissen aktiv einsetzen können, um das aktuell relevante Thema des Klimawandels aufgreifen zu können. Das Template lässt sich als Konzept unabhängig einsetzen, ergibt im Zusammenspiel mit anderen Themen zum Klimawandel aber inhaltlich am meisten Sinn.</span></p>\r\n\r\n<p> </p>\r\n"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e87")
					},
					{
						"title" : "Demokratie und Klimawandel",
						"hidden" : false,
						"component" : "neXboard",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"title" : "Demokratie und Klimawandel",
							"description" : "Brainstormt zum Thema Demokratie. Was bedeutet Demokratie für dich? Was verbindest du mit dem Begriff Demokratie?",
							"board" : "17876",
							"url" : "https://nexboard.nexenio.com/app/client/pub/17876/885f4445-x052-3dk1-p2q2-3114bw151736"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e86")
					},
					{
						"title" : "(Wiederholung) Was ist Demokratie?",
						"hidden" : false,
						"component" : "text",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"text" : "<p><u><strong>Gruppenarbeit: </strong></u></p>\r\n\r\n<p>Beantwortet die folgenden Fragen entsprechend eurer Gruppen in Stichpunkten. Verwendet dafür bitte das Etherpad unten und schreibt Eure Stichpunkte unter Euren Gruppennamen: </p>\r\n\r\n<div style=\"background:#eeeeee;border:1px solid #cccccc;padding:5px 10px;\"><strong>Gruppe 1: </strong><br />\r\nWelche Merkmale sind für eine Demokratie relevant? Wo findet demokratische Mitbestimmung statt?  (Nenne 3 Merkmale)</div>\r\n\r\n<div style=\"background:#eeeeee;border:1px solid #cccccc;padding:5px 10px;\"><strong>Gruppe 2: </strong><br />\r\nWodurch unterscheidet sich eine Demokratie von anderen Staatsformen? (Nenne 3 Unterschiede)</div>\r\n\r\n<div style=\"background:#eeeeee;border:1px solid #cccccc;padding:5px 10px;\"><strong>Gruppe 3:</strong> <br />\r\nWelche Formen der Demokratie gibt es?</div>\r\n\r\n<div style=\"background:#eeeeee;border:1px solid #cccccc;padding:5px 10px;\"><strong>Gruppe 4:</strong> <br />\r\nNenne Besonderheiten der deutschen Demokratie.</div>\r\n"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e85")
					},
					{
						"title" : "",
						"hidden" : false,
						"component" : "Etherpad",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"title" : "Sammlung: Demokratie und andere Staatsformen",
							"description" : "",
							"url" : "https://etherpad.schul-cloud.org/p/43hu8"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e84")
					},
					{
						"title" : "Info-Material für Eure Recherchen",
						"hidden" : false,
						"component" : "text",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"text" : "<p>Mit dem folgenden QR-Code gelangt ihr direkt zur Seite der Bundeszentrale für politische Bildung (bpb). <br />\r\nDort könnt ihr hilfreiche Informationen zum Thema <strong><em>Demokratie</em> </strong>finden, die euch sicherlich bei eurer Recherche helfen.<br />\r\n<img alt src=\"/files/file?file=5dc5423a1e7b1a0039ff046e&name=qr1.png\" style=\"height:400px;width:400px;\" /></p>\r\n\r\n<p>Link zum <a href=\"http://www.bpb.de/nachschlagen/lexika/pocket-politik/16391/demokratie\" target=\"_blank\">Pocket-Lexikon</a> von bpb.de</p>\r\n"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e83")
					},
					{
						"title" : "DEMOKRATIE - QUIZ",
						"hidden" : false,
						"component" : "text",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"text" : "<p>Mit dem folgenden QR-Code gelangt ihr direkt zu einem Quiz auf einer Seite der Bundeszentrale für politische Bildung (bpb). <br />\r\nDort könnt ihr zum Thema <strong><em>Demokratie</em> heraus </strong>finden, ob Ihr für die spätere Diskussion gut informiert seid.</p>\r\n\r\n<p><img alt src=\"/files/file?file=5dc5423a1e7b1a0039ff046d&name=qr2.png\" style=\"height:400px;width:400px;\" /><br />\r\nLink zum <a href=\"http://www.bpb.de/politik/grundfragen/deutsche-demokratie/70810/quiz-deutsche-demokratie-fuer-einsteiger\" target=\"_blank\">Quiz: Deutsche Demokratie für Einsteiger</a> von bpb.de</p>\r\n"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e82")
					},
					{
						"title" : "Welche Handlungsmöglichkeiten gibt es",
						"hidden" : false,
						"component" : "neXboard",
						"user" : ObjectId("5d8b6110bbc2a600195f27b7"),
						"content" : {
							"title" : "Brainstorming",
							"description" : "Beschreibt die Handlungsmöglichkeiten bzgl. des Klimawandels im Rahmen der Demokratie in Deutschland",
							"board" : "17917",
							"url" : "https://nexboard.nexenio.com/app/client/pub/17917/951u8983-f963-8xb3-w5z1-6799ve944331"
						},
						"_id" : ObjectId("5dc5187168ef9600366d7e81")
					}
				]
			}
		]);
		//

		await close();
	},

	down: async function down() {
		await connect();
		// ////////////////////////////////////////////////////

		// ////////////////////////////////////////////////////
		await close();
	},
};
