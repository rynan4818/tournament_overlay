const ui = (() => {
  if (html_id["overlay"]) var main = document.getElementById("overlay");
  var now_map = null;
  var pre_map = null;
  var pre_songHash = null;
  var now_energy = 50;
  var mod_instaFail = false;
  var mod_batteryEnergy = false;
  var obstacle_time = 0;
  var full_combo = true;
  var before_combo = 0;
  var qr_score = 0;
  var qr_acc = 0;
  var qr_miss = 0;
  var qr_faild = false;

  const performance = (() => {
    const cut_energy = 1;
    const misscut_energy = -10;
    const miss_energy = -15;
    const drain_energy = -0.13;  //per msec
    const battery_unit = 25;
    if (html_id["rank"]) var rank = document.getElementById("rank");
    if (html_id["percentage"]) var percentage = document.getElementById("percentage");
    if (html_id["score"]) var score = document.getElementById("score");
    if (html_id["raw_score"]) var raw_score = document.getElementById("raw_score");
    if (html_id["combo"]) var combo = document.getElementById("combo");
    if (html_id["miss"]) var miss = document.getElementById("miss");
    if (html_id["energy"]) var energy = document.getElementById("energy");
    if (html_id["energy_bar"]) var energy_bar = document.getElementById("energy_bar");
    if (html_id["mod_nf"]) var mod_nf = document.getElementById("mod_nf");

    function format(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (data) => {
      var performance = data.status.performance;
      qr_score = performance.score;
      qr_acc = (performance.score / performance.currentMaxScore * 100000.0).toFixed();
      qr_miss = performance.missedNotes;
      if (html_id["score"]) score.innerText = format(performance.score);
      if (html_id["raw_score"]) raw_score.innerText = format(performance.rawScore);
      if (html_id["combo"]) combo.innerText = performance.combo;
      if (html_id["rank"]) rank.innerText = performance.rank;
      if (full_combo) {
        if (before_combo > performance.combo) full_combo = false;
        switch (data.event) {
          case "noteMissed":
          case "bombCut":
          case "obstacleEnter":
            full_combo = false;
        }
      }
      before_combo = performance.combo;
      if (html_id["miss"]) {
        if (full_combo) {
          miss.innerText = "FC";
        } else {
          miss.innerText = performance.missedNotes;
        }
      }
      if (typeof performance.softFailed !== "undefined") {
        if (performance.softFailed === true) {
          now_energy = null;
          qr_faild = true;
          if (html_id["energy"]) energy.innerText = "NF";
          if (html_id["energy_group"] && energy_display) energy_group.setAttribute("style", "visibility: hidden");
          if (html_id["mod_nf"]) {
            mod_nf.style.color = "white";
            mod_nf.innerText = "Failed";
          }
        }
      }
      if (html_id["percentage"]) {
        var score_num = performance.score / performance.currentMaxScore * 100.0
        percentage.innerText = (performance.currentMaxScore > 0 ? score_num.toFixed(2) : "100.00") + "%";
      }
      if (now_energy !== null) {
        if (typeof performance.energy !== "undefined") {
          if (data.event === "energyChanged") {
            now_energy = performance.energy * 100;
          }
        } else {
          if (data.event === "obstacleEnter") {
            obstacle_time = data.time;
          }
          if (mod_instaFail === false && mod_batteryEnergy === false) {
            switch (data.event) {
              case "noteCut":
                now_energy += cut_energy;
                break;
              case "noteMissed":
                if (data.noteCut.saberType == null) {
                  now_energy += miss_energy;
                } else {
                  now_energy += misscut_energy;
                }
                break;
              case "bombCut":
                now_energy += miss_energy;
                break;
              case "obstacleExit":
                var delta_t = data.time - obstacle_time;
                now_energy += delta_t * drain_energy;
                break;
            }
          } else {
            switch (data.event) {
              case "noteMissed":
              case "bombCut":
                if (mod_instaFail === true) {
                  now_energy = 0;
                } else {
                  now_energy -= battery_unit;
                }
                break;
              case "obstacleExit":
                if (mod_instaFail === true) {
                  now_energy = 0;
                } else {
                  var delta_t = data.time - obstacle_time;
                  now_energy += parseInt(delta_t * drain_energy) * battery_unit;
                }
                break;
            }
          }
        }
        if (now_energy > 100) now_energy = 100;
        if (data.event === "failed"){
          qr_faild = true;
          now_energy = 0;
        }
        if (now_energy < 0) now_energy = 0;
        if (html_id["energy"]) energy.innerText = Math.round(now_energy) + "%";
        if (html_id["energy_bar"]) energy_bar.setAttribute("style", `width: ${Math.round(now_energy)}%`);
      }

      if (typeof op_performance !== "undefined") op_performance(data, now_energy);
    }
  })();

  const timer = (() => {
    const radius = 30;
    const circumference = radius * Math.PI * 2;

    if (html_id["progress"]) var bar = document.getElementById("progress");
    if (html_id["song_time"]) var song_time = document.getElementById("song_time");

    var active = false;

    var began;
    var duration;
    var length_min;
    var length_sec;
    var song_speed;

    var display;

    function format(time) {
      var minutes = Math.floor(time / 60);
      var seconds = time % 60;

      if (seconds < 10) {
        seconds = "0" + seconds;
      }

      return `${minutes}:${seconds}`;
    }

    function update(time) {
      time = time || Date.now();

      var delta = (time - began) * song_speed;

      var progress = Math.floor(delta / 1000);
      var percentage = Math.min(delta / duration, 1);

      if (html_id["progress"]) bar.setAttribute("style", `stroke-dashoffset: ${(1 - percentage) * circumference}px`);
      if (typeof op_timer_update !== "undefined") op_timer_update(time, delta, progress, percentage);

      // Minor optimization
      if (progress != display) {
        display = progress;
        if (html_id["song_time"]) song_time.innerText = format(progress);
        if (typeof op_timer_update_sec !== "undefined") op_timer_update_sec(time, delta, progress, percentage);
      }
    }

    function loop() {
      if (active) {
        update();
        requestAnimationFrame(loop);
      }
    }

    return {
      start(time, length, speed) {
        active = true;
        if (speed != false) song_speed = speed;
        began = time;
        duration = length * song_speed;

        length_min = Math.floor(duration / 1000 / 60);
        length_sec = Math.floor(duration / 1000) % 60;
        if (length_sec < 10) {
          length_sec = "0" + length_sec;
        }
        if (html_id["song_length"]) song_length.innerText = `${length_min}:${length_sec}`;

        loop();
      },

      pause(time) {
        active = false;

        update(time);
      },

      stop() {
        active = false;
        began = undefined;
        duration = undefined;
      },

      song_time_update(song_time) {
        began = Date.now() - Math.floor(song_time * 1000 / song_speed);
        update();
      }
    }
  })();

  const beatmap = (() => {
    const beatsaver_url = 'https://api.beatsaver.com/maps/hash/';
    const request_timeout = 5000; //msec
    if (html_id["image"]) var cover = document.getElementById("image");

    if (html_id["title"]) var title = document.getElementById("title");
    if (html_id["subtitle"]) var subtitle = document.getElementById("subtitle");
    if (html_id["artist"]) var artist = document.getElementById("artist");
    if (html_id["mapper_header"]) var mapper_header = document.getElementById("mapper_header");
    if (html_id["mapper"]) var mapper = document.getElementById("mapper");
    if (html_id["mapper_footer"]) var mapper_footer = document.getElementById("mapper_footer");

    if (html_id["difficulty"]) var difficulty = document.getElementById("difficulty");
    if (html_id["bpm"]) var bpm = document.getElementById("bpm");
    if (html_id["njs"]) var njs = document.getElementById("njs");
    if (html_id["njs_text"]) var njs_text = document.getElementById("njs_text");
    if (html_id["bsr"]) var bsr = document.getElementById("bsr");
    if (html_id["bsr_text"]) var bsr_text = document.getElementById("bsr_text");
    if (html_id["mod"]) var mod = document.getElementById("mod");
    if (html_id["mod_nf"]) var mod_nf = document.getElementById("mod_nf");
    if (html_id["pre_bsr"]) var pre_bsr = document.getElementById("pre_bsr");
    if (html_id["pre_bsr_text"]) var pre_bsr_text = document.getElementById("pre_bsr_text");
    if (html_id["energy"]) var energy = document.getElementById("energy");
    if (html_id["energy_group"]) var energy_group = document.getElementById("energy_group");
    var httpRequest = new XMLHttpRequest();

    function format(number) {
      if (Number.isNaN(number)) {
        return "NaN";
      }

      if (Math.floor(number) !== number) {
        return number.toFixed(2);
      }

      return number.toString();
    }

    return (data) => {
      var beatmap = data.status.beatmap;
      var time = data.time;
      var mod_data = data.status.mod;
      var visibility = "visible";
      var ip = query.get("ip");
      var diff_time = 0;
      full_combo = true;
      before_combo = 0;
      qr_score = 0;
      qr_acc = 0;
      qr_miss = 0;
      qr_faild = false;
      if (ip && ip != "localhost" && ip != "127.0.0.1") {
        diff_time = Date.now() - data.time;
        console.log(diff_time);
      }
      timer.start(beatmap.start + diff_time, beatmap.length, mod_data.songSpeedMultiplier);
      mod_instaFail = mod_data.instaFail;
      mod_batteryEnergy = mod_data.batteryEnergy;
      if (mod_instaFail === false && mod_batteryEnergy === false) {
        if (mod_data.noFail === true) {
          now_energy = null;
          visibility = "hidden";
          if (html_id["energy"]) energy.innerText = "NF";
        } else {
          now_energy = 50;
        }
      } else {
        now_energy = 100;
      }
      if (html_id["energy_group"]) energy_group.setAttribute("style", `visibility: ${visibility}`);
      if (beatmap.difficulty === "ExpertPlus") {
        beatmap.difficulty = "Expert+";
      }

      if (html_id["image"]) cover.setAttribute("src", `data:image/png;base64,${beatmap.songCover}`);

      if (html_id["title"]) title.innerText = beatmap.songName;
      if (html_id["subtitle"]) subtitle.innerText = beatmap.songSubName;
      if (html_id["bsr"]) bsr.innerText = '';
      if (html_id["bsr_text"]) bsr_text.innerText = '';

      httpRequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          now_map = this.response;
          if (now_map !== null) {
            if (html_id["bsr"]) bsr.innerText = now_map.key;
            if (html_id["bsr_text"]) bsr_text.innerText = bsr_text_org;
          }
          if (typeof op_beatsaver_res !== "undefined") op_beatsaver_res(now_map);
        }
      }

      if (pre_songHash === beatmap.songHash) {
        if (bsr_display && now_map !== null) {
          if (html_id["bsr"]) bsr.innerText = now_map.key;
          if (html_id["bsr_text"]) bsr_text.innerText = bsr_text_org;
        }
      } else {
        pre_songHash = beatmap.songHash;
        pre_map = now_map;
        now_map = null;
        if (bsr_display && beatmap.songHash !== null && beatmap.songHash.match(/^[0-9A-F]{40}/i)) {
          httpRequest.open('GET', beatsaver_url + beatmap.songHash.substr(0, 40), true);
          httpRequest.timeout = request_timeout;
          httpRequest.responseType = 'json';
          httpRequest.send(null);
        }
      }

      if (html_id["artist"]) artist.innerText = beatmap.songAuthorName;
      if (beatmap.levelAuthorName) {
        if (html_id["mapper_header"]) mapper_header.innerText = mapper_header_org;
        if (html_id["mapper"]) mapper.innerText = beatmap.levelAuthorName;
        if (html_id["mapper_footer"]) mapper_footer.innerText = mapper_footer_org;
      } else {
        if (html_id["mapper_header"]) mapper_header.innerText = "";
        if (html_id["mapper"]) mapper.innerText = "";
        if (html_id["mapper_footer"]) mapper_footer.innerText = "";
      }

      if (html_id["difficulty"]) difficulty.innerText = beatmap.difficulty;
      if (html_id["bpm"]) bpm.innerText = format(beatmap.songBPM);

      if (beatmap.noteJumpSpeed) {
        if (html_id["njs"]) njs.innerText = format(beatmap.noteJumpSpeed);
        if (html_id["njs_text"]) njs_text.innerText = njs_text_org;
      } else {
        if (html_id["njs"]) njs.innerText = "";
        if (html_id["njs_text"]) njs_text.innerText = "";
      }

      if (html_id["mod"]) {
        var mod_text = "";
        if (mod_data.instaFail === true) mod_text += "IF,";
        if (mod_data.batteryEnergy === true) mod_text += "BE,";
        if (mod_data.disappearingArrows === true) mod_text += "DA,";
        if (mod_data.ghostNotes === true) mod_text += "GN,";
        if (mod_data.songSpeed === "Faster") mod_text += "FS,";
        if (mod_data.songSpeed === "Slower") mod_text += "SS,";
        if (mod_data.noFail === true) mod_text += "NF,";
        if (mod_data.obstacles === false) mod_text += "NO,";
        if (mod_data.noBombs === true) mod_text += "NB,";
        if (mod_data.noArrows === true) mod_text += "NA,";
        mod_text = mod_text.slice(0, -1);
        mod.innerText = mod_text;
      }

      if (html_id["mod_nf"]) {
        if (mod_data.noFail === true) {
          mod_nf.innerText = "";
        } else {
          mod_nf.style.color = "yellow";
          mod_nf.innerText = "No NF!";
        }
      }

      if (pre_bsr_data === null) {
        if (html_id["pre_bsr"]) pre_bsr.innerText = "";
        if (html_id["pre_bsr_text"]) pre_bsr_text.innerText = "";
      } else {
        if (html_id["pre_bsr"]) pre_bsr.innerText = pre_map.key;
        if (html_id["pre_bsr_text"]) pre_bsr_text.innerText = pre_bsr_text_org;
      }
      if (typeof op_beatmap !== "undefined") op_beatmap(data, now_map, pre_map);
    }
  })();

  return {
    hide() {
      if (html_id["overlay"]) main.classList.add("hidden");
      if (typeof op_hide !== "undefined") op_hide();
    },

    show() {
      if (html_id["overlay"]) main.classList.remove("hidden");
      if (typeof op_show !== "undefined") op_show();
    },

    start_hidden_set() {
      start_hidden1 = true;
      start_hidden2 = true;
      if (menu_shine) {
        document.getElementById("TimingMark1").setAttribute("style", "visibility: visible");
        document.getElementById("TimingMark2").setAttribute("style", "visibility: visible");
        menu_shine = false;
      }
    },

    start_hidden_release1() {
      if (start_hidden1) {
        start_hidden1 = false;
        document.getElementById("TimingMark1").setAttribute("style", "visibility: hidden");
      }
    },

    start_hidden_release2() {
      if (start_hidden2) {
        start_hidden2 = false;
        document.getElementById("TimingMark2").setAttribute("style", "visibility: hidden");
      }
    },

    check_mark_hidden_set() {
      document.getElementById("checkMark1").setAttribute("style", "visibility: hidden");
      document.getElementById("checkMark2").setAttribute("style", "visibility: hidden");
      document.getElementById("checkMark3").setAttribute("style", "visibility: hidden");
      document.getElementById("checkMark4").setAttribute("style", "visibility: hidden");
    },

    async qr_set(){
      function imageToDataURI(img) {
        if (!img) return '';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(img.width, img.height);
        imageData.data.set(img.data);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.putImageData(imageData, 0, 0);

        return canvas.toDataURL();
      }
      async function qr_encord(value){
        const imgd = await qrean.encode(value, {
          codeType: 'mQR',
          dataType: 'NUMERIC',
          scale: 2
        }).then(imageToDataURI);
        if (!imgd) {
          console.log("ERROR");
          return;
        }
        const img = new Image();
        img.src = imgd;
        return img
      }
      var qr_cord1 = document.getElementById("QrCord1");
      var qr_cord2 = document.getElementById("QrCord2");
      qr_cord1.innerHTML = "";
      qr_cord2.innerHTML = "";
      qr_cord1.appendChild(await qr_encord(String(qr_score).padStart(7, '0')));
      var fll_combo_flag = '0';
      if (full_combo) {
        fll_combo_flag = '1';
      }
      if (qr_faild) {
        fll_combo_flag = '2';
      }
      qr_cord2.appendChild(await qr_encord(String(qr_acc).padStart(6, '0') + fll_combo_flag + String(qr_miss).padStart(4, '0')));
      console.log("QR");
    },
    
    qr_hidden() {
      var qr_cord1 = document.getElementById("QrCord1");
      var qr_cord2 = document.getElementById("QrCord2");
      qr_cord1.innerHTML = "";
      qr_cord2.innerHTML = "";
    },
    
    performance,
    timer,
    beatmap
  }
})();
