var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'jsontree-generator';

module.exports =  function outputJSON (totalItems, depth){

    var stream = through.obj(function(file, enc, callback) {

        // Dummy text taken from http://www.lipsum.com/
        var stringBlock = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae erat vel quam lobortis sagittis. Vestibulum porttitor lorem augue. Donec non quam non massa tempor tempor in tristique tortor. Nunc ac erat nulla. Suspendisse vel euismod dui. Pellentesque quis risus at sapien consequat varius. Nullam id magna auctor, vulputate sem nec, rutrum metus. Ut mattis nunc ut tristique vehicula. Vestibulum pulvinar viverra dolor in scelerisque. Fusce faucibus justo dolor, sed mollis magna consequat sed. Duis quis odio mollis, dapibus lorem id, consequat ligula. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris imperdiet non mi vel volutpat. Sed egestas faucibus libero quis facilisis. Sed placerat magna in erat egestas aliquam. Ut eu dui erat. Nulla sed porttitor massa, non accumsan odio. Nam vel pharetra augue, eu dictum neque. Phasellus congue feugiat diam, eu semper leo aliquam in. Nam accumsan velit sapien, non pellentesque ligula eleifend ac. Etiam lobortis eget arcu non cursus. Nullam commodo vel nisl vestibulum pellentesque. Morbi iaculis, nunc id bibendum viverra, enim urna mattis neque, quis accumsan tellus massa a tortor. Quisque sollicitudin turpis consequat euismod sollicitudin. Donec fermentum molestie erat ut vestibulum. Etiam congue gravida est, vel pulvinar urna. Nunc eleifend suscipit adipiscing. Donec in auctor lorem, eu fermentum nisi. Donec molestie diam enim. Cras nec nibh et diam accumsan ultrices non eu est. Nullam rutrum mauris tellus, ut semper lacus hendrerit id. Integer euismod risus orci, ultricies elementum diam dapibus quis. Suspendisse posuere bibendum neque, eu vulputate dui consequat vitae. Duis eu varius velit. Etiam ultrices risus eget ligula semper, a laoreet urna fringilla. Praesent at adipiscing nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam ligula risus, pellentesque nec neque sed, tempus consequat lectus. Nunc eu neque turpis. Praesent posuere commodo lectus vitae pharetra. Maecenas cursus bibendum elementum. In vitae semper eros. Sed eget massa diam. Morbi enim sem, consectetur eget ornare vel, vehicula sit amet felis. Sed ullamcorper dolor id ante dignissim, at placerat nulla consectetur. Sed sit amet cursus lacus. Suspendisse non nunc ac tortor porttitor elementum. Nulla non lobortis massa, ac volutpat metus. Mauris ultrices vestibulum enim sit amet auctor. Aenean adipiscing dolor quam, sit amet tincidunt nibh tristique a. Cras posuere ullamcorper odio. Phasellus sed nunc sit amet urna placerat pretium ut a mauris. Ut vitae ipsum sed enim venenatis pellentesque sit amet vel lorem. Sed vitae arcu eu dolor rutrum pharetra. Fusce condimentum ac sapien eu pellentesque. Sed mi purus, mattis et mauris quis, pulvinar dapibus risus. Fusce ligula sem, cursus ut odio vel, elementum porta lorem. Sed aliquet, velit ut dignissim ullamcorper, est diam egestas enim, et ultrices ante sem sit amet purus. Duis vestibulum erat id urna aliquam ornare. Fusce pellentesque libero leo. Integer mi tellus, venenatis a sem ut, iaculis scelerisque neque. Nullam aliquet odio ac mi posuere, a feugiat justo facilisis. Duis luctus semper lacinia. Cras velit libero, suscipit vel pharetra non, viverra at nisl. Suspendisse sit amet ligula augue. Suspendisse feugiat dictum lorem ac tincidunt. Maecenas est nunc, sodales non vestibulum eget, semper nec eros. Nullam ac est risus. Curabitur fermentum, felis in fermentum rhoncus, metus neque faucibus tortor, sed eleifend felis libero et orci. Sed ut velit pretium sapien pretium facilisis. Sed magna ligula, hendrerit non orci consequat, ullamcorper cursus ligula. Sed elit erat, varius tristique odio vitae, congue sagittis dolor. Proin iaculis tincidunt feugiat. Curabitur eget dapibus tellus. Vivamus id dui placerat ipsum pulvinar elementum ac sed nisl. Maecenas consectetur accumsan ante, non porttitor nunc. Integer in sem id enim sodales cursus. Suspendisse molestie risus at mollis posuere. Sed nunc leo, posuere nec convallis at, fermentum sed ipsum. Sed id vehicula sapien. Etiam non semper nibh, lobortis eleifend massa. Donec eget mauris mattis, ullamcorper dui in, molestie dui. Aenean pretium elit ac eleifend dictum. Sed ullamcorper laoreet turpis ac semper. Nullam luctus pellentesque purus ut mattis. Aliquam vestibulum dolor in orci condimentum, vitae rutrum arcu aliquet. Aliquam quis lacinia tellus. Sed massa odio, ornare in cursus nec, gravida at nibh. Nam facilisis arcu non imperdiet placerat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque massa ante, blandit id pellentesque non, malesuada a mauris. Morbi ornare sem interdum lacus mattis, quis elementum risus fringilla. Phasellus facilisis lorem nisi, auctor luctus enim vestibulum ac. Aenean placerat mauris quis arcu vulputate bibendum. Proin et enim non nibh fringilla pulvinar id sit amet velit. Aenean id urna ac tortor dignissim ullamcorper eget eget nisi. Ut auctor turpis nec risus rhoncus, eu mattis lorem scelerisque. In aliquet dolor eget arcu pharetra iaculis. Maecenas sit amet ipsum vel leo sagittis fringilla tincidunt id magna. Phasellus ultrices ligula turpis, sed sodales nibh suscipit quis. Morbi dictum, elit eget molestie fermentum, eros leo facilisis mi, vitae sollicitudin velit sem sed nulla. Nullam tincidunt purus at ligula pretium sollicitudin. Quisque et magna vel sapien tempor posuere ut sit amet erat. Integer nunc lacus, hendrerit vitae enim ut, pulvinar ullamcorper leo. Proin bibendum eget lectus at lobortis. Proin facilisis auctor orci, sit amet pretium mi imperdiet a. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam massa elit, tristique vitae dui vel, convallis euismod mauris. Vivamus vitae quam molestie, bibendum ante et, hendrerit leo. Fusce ut eros et neque egestas aliquam ac nec velit. Etiam ut libero lacinia, blandit augue id, pellentesque erat. Integer aliquam arcu et elit pharetra, in rhoncus eros vulputate."
        var nameBlock = "Hatsue Tsuda,Ryan Brady,Najma Martinsson,Eleanor Richardson,Ryuuji Nagasawa,Donald Cole,Lukaš Piško,Winta Ali,Meryem Reijntjes,Geirfinnur Friðgeirsson,Noel Cervántez,Svend Josefsen,Jabel Cepeda,Marcus Hallen,Sólbjört Sigfúsdóttir,Lei Tsai,Johanna Frey,Virginio Pichardo,Milly Simpson,Taija Niskavaara,Harue Nakahara,Thijm Litjens,Calum Paterson,Sævar Svansson,Barbara Marchand,Ane Løvstrøm,Tewelde Osman,Alaor Saldana,Sasara Shirai,Ranko Ćosić,Pierino Piazza,Össur Guðgeirsson,Marziyet Khadzhiyev,Bloeme Tjon,Kurzhan Kishiev,Hanna Paasivirta,Sally Graham,Joyce Teasley,Lavinia Costa,Rahel Sheshy,Erick Santos,Hanne Geisler,Pauline Lennert,Claudia Symes,Yoshiharu Kawahara,William Kent,Kyuuto Honma,Futsum Samuel,György Gyenes,Nicholas Cooper,Šeila Nedveš,Otilija Jelečević,Franka de,Kam,Andreja Jukić,Tomi Saariaho,Sanna Tikkanen,Metran Merino,Časlav Živković,Sirazhdi Masaev,Tereza Janáčová,Jolanta Pawłowska,Sarah Papst,Vilma Sandberg,Klara Zielinska,Liliana Lettiere,Natasza Walczak,Regine Davidsen,Brandi Denn,Zuzana Kopková,Henry Landry,Freydís Skarphéðinsdóttir,Mathias Aachen,Gustava Longo,Sari Kozawa,Cai Hsu,Alastair Reilly,Fethawi Negassi,Izabella Lindström,Beata Lund,Reona Iwasaki,Lubab Cham,Percy Hákonarson,Youhei Horiuchi,Ulpu Pokka,Nikola Bajlec,Ors Baranyi,Ovlur Umkhayev,Justin Martin,Belda Tremblay,Petronio Colombo,Gakuto Fukushima,Cong Yin,Abdullah Asmara,Maya Thompson,Kate Hunter,Kauê Martins,Ririko Takashima,Senior Givry,Alida Trevisan,Bozena Shubina,Thomas Coleman,Leonardo Jamieson,Timirbulat Godina,Marina Schaefer,Nikolaj Frederiksen,Xue,Fang Yuan,Merle Desroches,Desirée Serrano,Jeanne Agapova,Alacoque Bisson,Marcella Li,Fonti,Uberto Li,Fonti,Þorvaldur Loftsson,Kadyn Brown,Adhemar León,Mathias Bumgarner,Allaug Bjune,Sako Masuda,Encarna Miranda,Hugo Kottila,Timothy Mathis,Kimberly Nordbø,Rodion Alexeeva,Birning Stiansen,Maciej Moore,Ivalu Enoksen,Patryk Stevenson,Jimmy Lundqvist,Karen Tran,Bisrat Tesfay,Wilmer Jakobsson,Aino Kaitala,Tahvo Leminen,Arnaude Alexandre,Vinicius Lima,Marveille Gendron,Annemarije van,Emden,Ákos Sándor,Lincoln Pigot,Salóme Bryndísardóttir,Julian Almeida,Magomed Rushisvili,Lars Rosing,George Clemens,Elfa Ívarsdóttir,Anton Mogensen,Salomea Michalska,Guðgeir Kolbeinsson,Hideo Takahasi,Takuho Amano,Kuba Wysocki,Diana Dahlberg,Krisztofer Sági,Svend Berthelsen,Jeff Amos,Elżbieta Woźniak,Felizia Lindholm,Daniela Ćosić,Tena Klarić,Hester den,Ridder,Walid Nyberg,Olympics Efremova,'Adilah Abboud,Helena Dujmović,Pamela Sahernik,Charmaine Bonami,Marc Forbes,Venla Hyytiä,Petros Selam,Makda Afwerki,Alexander Ravn,Kirsten Løvstrøm,Miriam Crawford,Ryan Moriarty,Mayhew Laliberté,Niels Lange,Alicia Teigland,Makoto Nakagawa,Lovro Knežević,Yi Chin,André Araujo,Tewolde Eyob,Laia Bahena,Tamás Schmit,Himzo Remich,Josías Frías,Fred Dahl,Vidar Høiberg,Gojslav Lukić,Razija Pesičer,Lisa Robidoux,Riikka Lintilä,Orsolya Forgáts,Gradasso Favreau,Jón Bergsveinsson,Meeke van,der,Lugt,Polla Ryzaev,Stefanía Baldursdóttir,Max Walker,Rolleiv Lindberg,Marie Marková,Gunna Jóakimsdóttir,Mina Petersson,Madihah Negassi,David Michell,Wu Niu,Vivienne Chenard,Kaoru Nakamoto,Luděk Beneš,Kjølv Nordstrøm,Astrid Møller,Wakil Morcos,Irina Balashova,Anastasia Fredriksson,Bikatu Dratchev,Phoebe Wilkinson,Freddie Lundqvist,Durgali Inarkaevich,Medina Holcapfel,Dominika Kelemen,Gai Miyazaki,Vanda Hoffman,Benjamin Glover,Ludmila Kovářová,Sebastian McGregor,Chung Hsü,Morgan Dale,Bojana Mikulić,Huan,Yue He,Barry Thompson,Richard Poe,Gustav Lundin,Carl Repin,Renan Correia,Ken Pečjak,Szilveszter Halász,Ilona Kornilova,Camilla Giordano,Fesahaye Osman,Eriskhan Batukayev,Gjertinus Enge,Siniša Mađar,Slavko Barić,Ulderico Boni,Dorofei Anisimov,Kristian Kristiansen,Evdokim Alexandrov,Per Brandt,Anastasio Lorenzo,Adam Lauritsen,Berkant Dursun,Hollie Potter,Anne Jensen,Gabriel Samuel,Atiya Tannous,Bonacata Sabbatini,Evdokim Voronov,Tobias Lyberth,Katarina Horváth,Kjeld Wisløff,Yin Holwerda,Tomoki Niiya,Suray Arce,Kvetoslava Kadlecová,Aubin Grandbois,Peter Suorsa,Yvonne Kluge,Syed McIntyre,Morten Bech,Heloise Gladu,Ljupka Orter,Ena Horvat,Hamid Idris,Sveinn Arnþórsson,Zorka Martinović,Albano Palermo,Arsenio Genovese,Kadyn Gray,Judithe Møller,Emil Kruse,Tara Göransson,Zofia Pawlak,Marthijs Koolman,Caio Correia,Timur Kiss,Erik Koch,Stanislaus Prokhorova,Brianna Sturdee,Li,Mei Pan,Henrik Enoksen,Maslin Vincent,Husam,al,Din Nazari,Laurentino Soto,Tamara Kishiev,Mónica Granados,Marigona Rakitovac,Maximilian Dickson,Shamil Khouri,Audry Beelen,Walid Amari,Jan Přibyl,Sarika Rácz,Sander Bech,Zita Fenyvesi,Julitta Rutkowska,Xenophon Zhirov,Semhar Biniam,Reinholdt Grannes,Yong Lo,Declan Roerink,Roberto Ivarsson,Lucyna Król,Markku Paloranta,Ilijana Badalli,Bikatu Korgay,Luisa Milani,Alphonsine Benoit,Emma Dubinina,Caresse Ducharme,Gisela Terán,Jeppe Lund,Alphonsine Labrie,Sarah Eiffel,Márkó Takách,Shu,Fang Tung,Daniele Valen,Erlendur Ludvigsson,Eyob Fethawi,Božena,Natalija Fištrovič,Jensine Nielsen,Aydin van,Silfhout,Max Vaverka,Vratislav Fojtů,Kedar Basara,Åsveig Norum,On Sung,Lidya Gabriel,Vicuska Sultis,Yuan Ch'ien,Jussi Laukka,Mauro Greco,Badri Botros,Tobias Sørensen,Mario Daecher,Wiert Houkes,Jonathan Holst,Elvio Štabej,Feaven Daniel,Ludmiła Wojciechowska,Dennis Richter,Clothilde Lacroix,Isabelle Silva,Klaus Schuhmacher,Jaroslava Balounová,Chinouk Slabbers,Hessa Isa,Blaženka Vujaković,Ralf Beich,Fesahaye Adonay,Berdinus Rosenvinge,Harbin Paimboeuf,Karlotta Joly,Abeba Ermias,Lechosława Wieczorek,Ljubinko Štajnbaher,Tahlia Ayers,Rion Yoshimura,Louise Hansen,Ísfold Tryggvadóttir,Seniha Kontič,Aminah Dagher,Isni Novinec,Zekö Vince,Souichi Shimizu,Erick Lima,Mireille Lapierre,Marzhan Korgay,Jean Washington,Petros Tesfalem,Ju Lü,Phillipp Muench,Nikolina Berg,Bacchus Rolón,Fredo Dimović,Věra Plzáková,Szebasztián Lörinc,Maria Pihlava,Kondrat Zhirov,Ramzi Morcos,Hamid Tesfay,Shishay Osman,Camilla Koltsova,Praskovya Komarova,Forbes Hill,Rushdi Sarraf,Zoltan Moličnik,Nancy Burman,Daniel Chenard,Larisa Kishiev,Sigurþór Samúelsson,Michael Kozlov,Micheal Mackey,Kristiane Langøy,Melissa Fuller,Zargan Arsanukayev,Drew Reid,Roderick Gibson,Vitoria Lima,Eshan Maclean,Halgerd Soleng,Šemsija Pridgar,Emeterio Najera,Alisha Sinclair,Mikayla Puddy,Salikh Akhtakhanov,Izolda Sawicka,Tobias Sandgreen,Anna Foerster,Ali Tesfalem,Fredek Fenyvessy,Robert Knápek,Meggi Mekicar,Teruyoshi Chiba,Timo Tiainen,Taemi Katagiri,Kidane Abraham,Urszula Woźniak,Lea Jager,Kenneth Craig,Zhi Ch'en,Line Madsen,Hallsteinn Yngvason,Yasin Wasem,Edward Brown,Jindřich Kraus,Isami Aoyama,Silje Abrahamsson,Vigar Heggedal,Vladlen Seleznyov,Mhret Mebrahtu,Eilert Høiland,Angelika Friedman,Judas Rendón,Grímur Frímannsson,Yong Yuan,Hiroyo Kudo,Nazia van,Nuland,Boris Horvatinčić,Jaakko Autio,Obed Quintana,Matija Petrović,Luwam Girmay,Brigitte Trommler,Cornelius Høiseth,Alfred Hansen,Vala Skúladóttir,Martin Andreasen,Asmart Godina,Aldo Milano,Michaela Moore,Aidan Bale,Lei Lu,Michael Gregor,Alma Gregersen,Tewelde Fikru,Carl-Johan Sundberg,Roelfina Ardon,Hu Wan,Yul Chien,Denes Erôs,Nadia Sundström,Jernejka Dvoraček,Taymaskha Musliyevich,Matthew Robson,Joel Oxley,Henny de,Bondt,Naïm Treffers,Gebre Filmon,Christian Bumgarner";

        // Names taken from Fake Name Generator http://www.fakenamegenerator.com/license.php
        var stringArray = stringBlock.split(" ").join(",").split(".").join(",").toLowerCase().split(",");
        var nameArray = nameBlock.split(",");

        /*
         Generate random numbers, define top limit with "top" parameter
         */
        var randomNumber = function(top){
            var top = top || 100000;
            return Math.floor(Math.random()*(top+1));
        };

        /*
         Generate random strings from string block list, define number of strings with "number" parameter
         */
        var randomString = function(number){
            var number = number || 10;
            var output = "";
            for(var i = 0; i < number; i++){
                var randomPlace = randomNumber(stringArray.length);
                output += stringArray[randomPlace] + " ";
            }
            return output;
        };

        /*
         Connect strings into different string types, define "type" and "number" of strings
         type options = name, title, sentence
         */
        var styledString = function(type, number){
            var output = "";
            var end = " ";
            for(var i = 0; i < number; i++){
                var word = randomString(1);
                switch(type) {
                    case "name":
                        word = word.charAt(0).toUpperCase() + word.slice(1);
                        break;
                    case "title":
                        word = word.charAt(0).toUpperCase() + word.slice(1);
                        break;
                    case "sentence":
                        if(i==0){
                            word = word.charAt(0).toUpperCase() + word.slice(1);
                        }
                        if(i == number-1){
                            end = ".";
                        };
                        break;
                }
                output += word + end;
            }
            return output;
        };

        /*
         Get a random person name from name array
         */
        var randomPerson = function(){
            return nameArray[randomNumber(nameArray.length)];
        };

        /*
         Return a random boolean
         */
        var randomBoolean = function(){
            var num = randomNumber(1);
            if(num < 1){
                return false;
            } else {
                return true;
            }
        };

        /*
         Return a random option from those defined, (mimicking multiple choice), "options" is a string with comma separated items
         */
        var randomOption = function(options){
            var list = options.split(",");
            var choice = list[randomNumber(list.length)];
            return choice;
        };

        /*
         Return an array of certain "type" and "length"
         Types are = mixed (default), string only, number only, boolean only
         */
        var randomArray = function(type, length){
            var randomArray = [];
            var num = 0;
            for (var i = 0; i < length; i++){
                switch(type) {
                    case "string":
                        num = 1;
                        break;
                    case "number":
                        num = 2;
                        break;
                    case "boolean":
                        num = 0
                        break;
                    default :
                        num = randomNumber(2);
                }
                switch(num) {
                    case 2:
                        randomArray.push(randomNumber())
                        break;
                    case 1:
                        randomArray.push(randomString())
                        break;
                    default:
                        randomArray.push(randomBoolean())
                }
            }
            return randomArray;
        };

        /*
         Construct your json object
         */
        var obj = function (id, parent, indent){
            this.id = id;
            this.parent = parent;
            this.indent = indent;
            this.person =  randomPerson();
            this.desc = styledString("sentence", 14);
            this.title = styledString("title", 5);
            this.kind = randomOption("item,folder");
            this.age = randomNumber(60);
            this.skills = randomOption("js,css,html,python");
            this.open = randomBoolean();
            this.stuff = randomArray("mixed", randomNumber(8));
            this.show = true;
            this.open = randomBoolean();
            this.date = new Date();
            this.icon = randomOption("fa-file-archive-o,fa-file-audio-o,fa-file-code-o,fa-file-excel-o,fa-file-image-o,fa-file-movie-o,fa-file-o,fa-file-pdf-o,fa-file-photo-o,fa-file-picture-o,fa-file-powerpoint-o,fa-file-sound-o,fa-file-text,fa-file-text-o,fa-file-video-o,fa-file-word-o,fa-file-zip-o");
            this.children = [];
        };

        /*
         Build a json object going down "level" number of levels.
         */
        var counter = 1;
        var buildJSON = function redo (level, parent, indent){
            if(counter < totalItems){
                var childarray = [];
                var totalIteration;
                if(totalItems < 50){ totalIteration = 5; } else { totalIteration = 20; }
                var iteration = randomNumber(totalIteration);
                var remainingItems = totalItems-counter;
                if(remainingItems<5){ iteration = remainingItems}
                for(var i  = 0; i < iteration; i++){
                    var thisObj = new obj(counter, parent, indent);
                    if( counter === 1){ thisObj.open = true; }
                    counter++;
                    if( level > 0 && iteration != remainingItems) {
                        thisObj.children = redo (level-1, thisObj.id, indent+1);
                    }
                    childarray.push( thisObj);
                }
                return childarray;
            }
            return [];
        };
        var output = buildJSON(depth, 0, 0);

        var outputBuffer = new Buffer(JSON.stringify(output));
        if (file.isNull()) {
            // Do nothing if no contents
            throw new PluginError(PLUGIN_NAME, "The file is empty or there was no file. ");
        }
        if (file.isBuffer()) {
            file.contents = Buffer.concat([outputBuffer]);
        }
        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "Stream isn't supported yet. ");
        }
        this.push(file);
        return callback();
    });
    return stream;
}