const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');

const btnPlay = $('.btn-toggle-play');
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const player = $('.player');
const playlist = $('.playlist');
const progress = $('#progress');

const btnVol = $('.btn-volume');
const volBar = $('.volume-bar');
const iconMute = $('.icon-mute');
const iconUnmute = $('.icon-unmute');
const bgColor = $('.dashboard');
const btnFace = $('.btn-face');
const timeLeft = $('.time-left');
const timeRight = $('.time-right');


const app = {
    currentIndex: 0,
    currentVol: 1,
    lockVol: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isFace: false, 
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Sau Lời Từ Khước',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/SauLoiTuKhuoc.mp3',
            image: './asset/img/Sauloitukhuoc.jpg',
        },
    
        {
            name: 'Nhạt',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/Nhat.mp3',
            image: './asset/img/Nhat.jpg',
        },
    
        {
            name: 'Khi Phải Quên Đi',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/KhiPhaiQuenDi.mp3',
            image: './asset/img/Khiphaiquendi.jpg',
        },
    
        {
            name: 'Sao Cha Không',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/SaoChaKhong.mp3',
            image: './asset/img/Saochakhong.jpg',
        },
    
        {
            name: 'Từ Đó',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/TuDoMatBiec.mp3',
            image: './asset/img/Tudo.jpg',
        },
    
        {
            name: 'Khi Người Mình Yêu Khóc',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/KhiNguoiMinhYeuKhoc.mp3',
            image: './asset/img/Khinguoiminhyeukhoc.jpg',
        },
    
        {
            name: 'Vợ Người Ta',
            singer: 'Phan Mạnh Quỳnh',
            path: './asset/song/VoNguoiTa.mp3',
            image: './asset/img/Vonguoita.jpg',
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls =  this.songs.map((song,index) => {
            return `
            <div class="song ${this.currentIndex === index ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
        </div>
            `
        });
        playlist.innerHTML = htmls.join('');
    },

    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        
        const formattedTime = `${minutes}:${remainderSeconds.toString().padStart(2, '0')}`;
        return formattedTime;
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function() {

        // Xử lý CD Rotate

        const cdThumbAnimate = cdThumb.animate([
            {transform: "rotate(360deg)"}
        ],{
            duration: 10000, // 10 giây
            iterations: Infinity
        })

        cdThumbAnimate.pause();

        //Xử lý khi cuộn sẽ phóng to thu nhỏ CD
        const _this = this;
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newcdWidth = cdWidth - scrollTop;

            cd.style.width = newcdWidth > 0? newcdWidth + 'px': 0;
            cd.style.opacity = newcdWidth / cdWidth;
        }

        //Xử lí khi nhấn vào button Play
        btnPlay.onclick = () =>{
            if(_this.isPlaying){
                audio.pause();
            }else {
                audio.play();
            }
        }

        //Khi bài hát chạy
        audio.onplay = () =>{
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi bài hát dừng
        audio.onpause = () =>{
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Thanh tiến độ bài hát chạy
        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                // Hiện time    
                timeLeft.textContent = _this.formatTime(Math.floor(audio.currentTime));
                timeRight.textContent = _this.formatTime(Math.floor(audio.duration));
                progress.style.background = `linear-gradient(to right, #ec1f55 ${progressPercent}%  , #D3D3D3 ${progressPercent}% )`;
            }
        }

        // Xử lý khi tua bài hát
        progress.oninput = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // Xử lí khi chọn bài hát tiếp theo
        btnNext.onclick = function(){
            if(_this.isRandom){
                _this.playRanDomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            //_this.render();
            $('.song.active').classList.remove('active');
            $$('.song')[_this.currentIndex].classList.add('active');
            _this.scrollToActiveSong();
        }

        // Xử lí khi chọn bài hát trước
        btnPrev.onclick = function(){
            if(_this.isRandom){
                _this.playRanDomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            //_this.render();
            $('.song.active').classList.remove('active');
            $$('.song')[_this.currentIndex].classList.add('active');
            _this.scrollToActiveSong();
        }

        // Xử lí khi bật / tắt bài hát ngẫu nhiên
        btnRandom.onclick = function(e){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            btnRandom.classList.toggle('active', _this.isRandom);   
        }

        // Xử lí khi bật / tắt lặp lại bài hát 
        btnRepeat.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            btnRepeat.classList.toggle('active', _this.isRepeat);
        }

        //Xử lý chuyển bài khi hết bài hát hiện tại
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            }else{
                btnNext.click();
            }
        }

        //Lắng nghe hành vi bấm vào Playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(active)');
            if(songNode || e.target.closest('.option')){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    $('.song.active').classList.remove('active');
                    $$('.song')[_this.currentIndex].classList.add('active');
                    _this.loadCurrentSong();
                    audio.play();
                    //_this.render();
                }
            }
        }

        //Xử lí Volume-bar
        volBar.oninput = e => {
            this.setConfig("currentVol", e.target.value);
            audio.volume = volBar.volume;
        };

        //Kiểm tra Volume
        if(_this.currentVol > 0) {
            volBar.volume = _this.currentVol;
            audio.volume = _this.currentVol;
            iconUnmute.style.visibility = "visible";
            iconMute.style.visibility = "hidden";
        }else{
            volBar.volume = 0;
            audio.volume = 0;
            iconUnmute.style.visibility = "hidden";
            iconMute.style.visibility = "visible";
        }

        //Thay đổi volume
        audio.onvolumechange = () => {
            volBar.value = audio.volume;
            if(audio.volume === 0 ){
                iconMute.style.visibility = "visible";
                iconUnmute.style.visibility = "hidden";
            }else{
                iconMute.style.visibility = "hidden";
                iconUnmute.style.visibility = "visible";
            }
        };

        //Xử lý khi Unmute Volume
        iconUnmute.onclick = (e) => {
            this.setConfig("lockVol",audio.volume);
            audio.volume = 0;
            this.setConfig("currentVol",audio.volume);
        };

        //Xử lý  khi Mute Volume
        iconMute.onclick = (e) => {
            audio.volume = this.config.lockVol;
            this.setConfig("currentVol",audio.volume);
        };

        //Background Theme
        btnFace.onclick = function() {
            const songs = $$('.song');
            this.isFace = !this.isFace;            
            if(this.isFace) {
                bgColor.classList.add('bg');
                heading.style.color = 'white';                
                songs.forEach(function(song) {
                    songs.forEach(function(item) {
                        item.classList.add('bg');                        
                    });
                    song.querySelector('h3').style.color = 'rgba(255, 255, 255, 0.7)';
                });
            } else {
                bgColor.classList.remove('bg');
                heading.style.color = '';
                songs.forEach(function(song) {
                    songs.forEach(function(item) {
                        item.classList.remove('bg');
                    });
                    song.querySelector('h3').style.color = '';
                });
            }
            btnFace.classList.toggle('active', this.isFace);
        }
    },

    scrollToActiveSong: function() {
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'end',
            })
        }, 300);
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.isFacebook = this.config.isFace;
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRanDomSong: function() {
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function(){
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe/ Xử lí các sự kiện (DOM Event)
        this.handleEvent();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render Playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
        btnRepeat.classList.toggle('active', this.isRepeat);
        btnRandom.classList.toggle('active', this.isRandom);
    }
}

app.start();