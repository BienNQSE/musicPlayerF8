
/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'B13';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Điều Em Không Biết",
            singer: "Quang Vinh",
            path: "./songs/DieuEmKhongBiet-QuangVinh-5327017_hq.mp3",
            image: "https://i.ytimg.com/vi/ZT89__da6XI/maxresdefault.jpg"
        },
        {
            name: "Con Đường Tình Yêu",
            singer: "Lam Trường",
            path: "./songs/ConDuongTinhYeu-LamTruong_3cxrr.mp3",
            image: "https://avatar-ex-swe.nixcdn.com/singer/avatar/2018/06/07/7/2/a/a/1528338325576_600.jpg"
        },
        
        {
          name: "Miền Cát Trắng",
          singer: "Quang Vinh",
          path: "./songs/MienCatTrangGreatestHitsTheMemories-QuangVinh-5260394_hq.mp3",
          image:
            "https://i.ytimg.com/vi/bLXN8F8544A/maxresdefault.jpg"
        },
        {
            name: "Tình Yêu Mang Theo",
            singer: "Nhật Tinh Anh",
            path: "./songs/Tinhyeumangtheo-NhatTinhAnh-7637.mp3",
            image: "https://i1.sndcdn.com/artworks-000142678696-auo3n0-t500x500.jpg"
        },
        {
            name: "Thế Giới Diệu Kỳ",
            singer: "Quang Vinh",
            path: "./songs/The-Gioi-Dieu-Ky-Quang-Vinh.mp3",
            image:
              "https://media1.nguoiduatin.vn/media/ha-thi-kim-dung/2019/08/18/tieu-su-ca-si-quang-vinh-3.jpg"
        },
        {
          name: "Đêm Trăng Tình Yêu",
          singer: "Hải Băng",
          path: "./songs/DemTrangTinhYeu-HaiBang-2815466.mp3",
          image:
            "https://file.tinnhac.com/resize/600x-/2016/08/04/112-4501.jpg"
        },
        {
            name: "Tình Thôi Xót Xa",
            singer: "Lam Trường",
            path: "./songs/TinhThoiXotXa-LamTruong-2453487.mp3",
            image:
              "https://i.ytimg.com/vi/f5nRLKySaLQ/maxresdefault.jpg"
        },
        
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function(){
       const html =  this.songs.map((song, index)=>{
            return `
                    <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
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
            `;
        });
        playlist.innerHTML = html.join('');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        });
    },

    handleEvent: function(){
        const _this = this;

        // XỬ lý cd quay / dừng

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 360000,
            iteration: Infinity
        });
        cdThumbAnimate.pause(); 

        // Xử lý ẩn hiện cd thumb
        const cdWidth = cd.offsetWidth;
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        }

        // Xử lý khi click play button
        playBtn.onclick = function(){
            if(_this.isPlaying){
                // nếu isPlaying đang là true thì pause khi click nút play btn
                audio.pause();
                
            }else{
                // nếu isPlaying đang là false thì play khi click nút play btn
                audio.play();
                

            }
            
        }

        // khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // Xử lý khi tua
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value; 
            audio.currentTime = seekTime;
        }

        // khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            } 
            
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            } 
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi shuffer song : bật tắt random song
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý phát lại bài hát khi click repeat
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý khi kết thúc bài hát
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            }
            
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            // trừ bài hát đang active
            if(songNode || e.target.closest('.option')){
                // Xử lý khi click vào song
                if(songNode){
                    // songNode.getAttribute('data-index');
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();

                }

                // Xử lý khi click vào song option
                if(e.target.closest('.option')){

                }
                
            }
        }
    },

    loadCurrentSong: function(){
        
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    // learn more scrollIntoView
    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300)
        
    },

    start: function() {

        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // định nghĩa các thuộc tính cho obj
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM envent)
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI
        this.loadCurrentSong();

        // Render Playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
};

app.start();
