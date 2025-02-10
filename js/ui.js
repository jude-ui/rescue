"use strict";
(function () {
  const jsAppKey = '89b0a44e1f81d77a4103cc826a62c52f'
  const restApiKey = '49fe230c6fcd8c55afb8200126317160'
  const shareFb = document.querySelector('.ico_sns1')
  const shareX = document.querySelector('.ico_sns2')
  const shareBd = document.querySelector('.ico_sns3')
  const shareKt = document.querySelector('.ico_sns4')
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent($(document).find('title').text())
  
  shareX.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank', 'width=600,height=500,scrollbars=no,toolbar=no')
  })
  shareFb.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(`http://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=500,scrollbars=no,toolbar=no');
  })
  shareBd.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(`https://band.us/plugin/share?body=${title} ${url}&route=${url}`, '_blank', 'width=600,height=500,scrollbars=no,toolbar=no')
  })
  shareKt.addEventListener('click', (e) => {
    e.preventDefault();
    Kakao.init(jsAppKey);
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: $.trim($('meta[property="og:title"]').attr('content')),
        imageUrl: $.trim($('meta[property="og:image"]').attr('content')),
        link: {mobileWebUrl: $.trim($('meta[property="og:url"]').attr('content')), webUrl: $.trim($('meta[property="og:url"]').attr('content'))}
      }
    });
  })
  
  document.querySelector(".btn_url").addEventListener("click", function () {
      const url = this.getAttribute("data-url"); // data-url 값 가져오기
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          alert("URL이 복사되었습니다.");
        }).catch(err => {
          alert("URL 복사를 실패했습니다. 다시 시도해 주세요.");
          console.error('복사 실패 : ', err)
        });
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("URL이 복사되었습니다.");
      }
  });
  
  document.querySelectorAll('.txt_info a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // 기본 이벤트 방지
  
        // 이동할 대상 ID 가져오기
        const targetId = this.getAttribute('href')
        const targetElement = document.getElementById(targetId);
        console.log(targetId, targetElement);
  
        // 해당 섹션으로 부드럽게 스크롤
        targetElement.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;  // 위도
      const lng = position.coords.longitude; // 경도
      const road_address = document.querySelector('#road_address')
      const address = document.querySelector('#address')
      const url = `//dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`;
  
      mapRender(lat, lng, road_address, address)
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${restApiKey}`
        },
      }).then(response => response.json())
      .then(data => {
        if(data.documents[0].road_address){
          road_address.innerHTML = data.documents[0].road_address.address_name
        } else {
          road_address.innerHTML = '없음'
        }
        if(data.documents[0].address){
          address.innerHTML = data.documents[0].address.address_name
        }
      })
      .catch(error => {
        console.log(error);
      });
    },
    (error) => {
      alert("위치 정보를 가져올 수 없습니다, 새로고침 해 주세요.", error);
    },
    {
      enableHighAccuracy: true, // 위치 정확도 높이기
      timeout: 5000, // 5초 내 응답 없으면 실패 처리
      maximumAge: 0 // 항상 최신 위치 정보 가져오기
    }
  );
  
  
  function mapRender(lat, lng, road_address, address) {
    const markerPosition = new kakao.maps.LatLng(lat, lng)
    const mapContainer = document.getElementById('map') // 지도를 표시할 div 
  
    var geocoder = new kakao.maps.services.Geocoder(); // 주소-좌표 변환 객체를 생성합니다
  
    var infowindow = new kakao.maps.InfoWindow({zindex:1}); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다
  
  
    const mapOption = { 
      center: markerPosition, // 지도의 중심좌표
      level: 3, // 지도의 확대 레벨
    };
    const map = new kakao.maps.Map(mapContainer, mapOption) // 지도를 생성합니다
  
    const marker = new kakao.maps.Marker({
      position: markerPosition
    })
    marker.setMap(map);
  
    // 지도를 클릭했을 때 클릭 위치 좌표에 대한 주소정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
      searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
        createLocationInfo(result, status, mouseEvent.latLng)
      });
    });
    function createLocationInfo(result, status, latLng = null) {
      if (status === kakao.maps.services.Status.OK) {
        var detailAddr = !!result[0].road_address ? `<div class="address">도로명주소 : ${result[0].road_address.address_name}</div>` : '';
        detailAddr += `<div class="address">지번 주소 : ${result[0].address.address_name}</div>`;
        
        var content = `<div class="info_marker">
                        ${detailAddr}
                      </div>`;
  
        // 마커를 클릭한 위치에 표시합니다 
        if (latLng) {
          marker.setPosition(latLng);
        }
  
        // 인포윈도우에 클릭한 위치에 대한 법정동 상세 주소정보를 표시합니다
        infowindow.setContent(content);
        infowindow.open(map, marker);
  
        if(result[0].road_address){
          road_address.innerHTML = result[0].road_address.address_name
        } else {
          road_address.innerHTML = '없음'
        }
        if(result[0].address){
          address.innerHTML = result[0].address.address_name
        }
      }   
    }
  
    geocoder.coord2Address(lng, lat, createLocationInfo)
  
    function searchDetailAddrFromCoords(coords, callback) {
      // 좌표로 법정동 상세 주소 정보를 요청합니다
      geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    }
  
    // 지도 세팅
    // map.setMinLevel(4); // 최대 확대 가능 레벨 설정
    // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성 및 위치 설정
    // const mapTypeControl = new kakao.maps.MapTypeControl()
    // map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)
  
    // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성 및 위치 설정
    // const zoomControl = new kakao.maps.ZoomControl()
    // map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)
  }
  
  
  
  
  
  /**
     * LayerComm Class
     * @class
     * @param {Object}  [options] - LayerComm 클래스의 옵션 설정
     * @param {string}  [options.defaultLayerName] - 레이어 팝업을 작동 시키기 위한 팝업 기본 클래스명
     * @param {string}  [options.openClass] - 레이어 팝업 토글 시키는 클래스명
     * @param {string}  [options.activeClass] - 현재 초점이 있는 레이어 팝업에 붙는 클래스명
     * @param {Function} [options.beforeOpen] - 레이어 팝업 열기 전 콜백 함수
     * @param {Function} [options.afterOpen] - 레이어 팝업 열고난 뒤 콜백 함수
     * @param {Function} [options.beforeClose] - 레이어 팝업 닫기 전 콜백 함수
     * @param {Function} [options.afterClose] - 레이어 팝업 닫고난 후 콜백 함수
     */
  class LayerComm {
    constructor(el, options = {}) {
      this.el = el
      this.openClass = options.openClass ? options.openClass : 'on'
      this.activeClass = options.activeClass ? options.activeClass : 'active'
      this.defaultLayerName = $.trim(el ? el : '')
      this.layers = {} // 개별 팝업 콜백 저장 객체
      
      this._handleOpenLayer = this._handleOpenLayer.bind(this)
      this._handleCloseLayer = this._handleCloseLayer.bind(this)
  
      this._currentScrollTop = null
      this._$body = $('body')
      this._$window = $(window)
  
      this.fstTab = null
      this.lstTab = null
      this.currentLayer = null
  
      this.openButton = null
      this.parentLayer = null
      this.beforeLayer = null
  
      this.focusableSelectors = ['a[href]', 'iframe', 'input', 'select', 'textarea', 'button', '[tabindex="0"]', '[contenteditable]']
  
      this.callbacks = {}
  
      if (options.on) {
        for (const [event, callback] of Object.entries(options.on)) {
          this.on(event, callback)
        }
      }
      
      this.init()
    }
  
    init() {
      // 동적 이벤트 할당 코드는 관심강좌 팝업과 같은 상황에 따라 열리는 팝업을 다르게 가져갈 시 주의
      $(document).on('click', '[data-open-layer]', this._handleOpenLayer)
      $(document).on('click', '[data-close-layer]', this._handleCloseLayer)
  
      this._executeCallback(this, 'init')
    }
  
    on(event, callback) {
      if (!this.callbacks[event]) {
        this.callbacks[event] = []
      }
      this.callbacks[event].push(callback)
    }
  
    getOpenLayerCount() {
      const $activePopup = $(this.defaultLayerName).filter(`.${this.openClass}`)
      const activeClassPopups = $activePopup.length
      const openDialogs = $('dialog[open]').length
      return activeClassPopups + openDialogs
    }
  
    isBodyFixed() {
      return this._$body.css('position') === 'fixed'
    }
  
    fix() {
      if (!this.isBodyFixed()) {
        const isOverflow = document.documentElement.clientHeight < document.documentElement.scrollHeight
  
        this._currentScrollTop = this._$window.scrollTop()
        const styles = {
          position: 'fixed',
          top: -this._currentScrollTop,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: isOverflow ? 'scroll' : '',
        }
        this._$body.css(styles)
      }
    }
  
    unfix() {
      if (this.isBodyFixed() && this.getOpenLayerCount() === 1) {
        this._$body.removeAttr('style')
        this._$window.scrollTop(this._currentScrollTop)
      }
    }
  
    _handleOpenLayer(e) {
      e.preventDefault();
  
      const layerId = $(e.currentTarget).data('openLayer')
      if (!(typeof layerId === 'undefined' || layerId === "")) {
        let $layer = $(`#${layerId}`)
        if ($layer.closest(this.el).length) {
          this.open($layer)
        }
      }
    }
  
    _handleCloseLayer(e) {
      e.stopPropagation()
      const $target = $(e.target)
  
      // 클릭한 요소가 [data-close-layer] 일 경우
      if ($target.is('[data-close-layer]')) {
        e.preventDefault()
        let $layer = $target.closest(this.defaultLayerName)
        if ($layer.closest(this.el).length) {
          this.close($layer)
        }
      }
    }
    
    togglePopup($layer, action) {
      if (action === 'open') {
        if ($layer.prop('tagName') === 'DIALOG') {
          $layer.get(0).showModal()
        } else {
          $layer.addClass(this.openClass)
        }
      } else {
        if ($layer.prop('tagName') === 'DIALOG') {
          $layer.get(0).close()
        } else {
          $layer.removeClass(this.openClass)
        }
      }
    }
  
    _$openButton($layer) {
      return $(`[data-open-layer="${$layer.attr('id')}"]`)
    }
  
    _$parentLayer($layer) {
      return this._$openButton($layer).closest(this.defaultLayerName)
    }
    
    _$beforeLayer($layer) {
      return $(`#${$layer.attr('id')}`)
    }
  
    open($layer) {
      this._executeCallback(this, 'beforeOpen') // 콜백
      
      this.currentLayer = $layer
      this.openButton = this._$openButton($layer).get(0)
      this.parentLayer = this._$parentLayer($layer).get(0)
  
      const isHidden = $layer.css('display') === 'none'
  
      // body 고정 유무 체크 후, body 고정
      this.fix()
  
      // 팝업 종류 체크하여 Open
      this.togglePopup($layer, 'open')
  
      // display:none 체크하여 첫번째 요소로 초점 이동
      if (isHidden) {
        this.focusFirstElement($layer)
      } else {
        $layer.one('transitionend', () => this.focusFirstElement($layer))
      }
      
      // 현재 열려 있는 팝업이 있다면 모두 active 해제, 지금 여는 팝업만 active 추가
      this._$parentLayer($layer).removeClass(this.activeClass)
      $layer.addClass(this.activeClass)
  
      this._executeCallback(this, 'afterOpen') // 콜백
    }
  
    close($layer, target) {
      this._executeCallback(this, 'beforeClose') // 콜백
  
      this.currentLayer = $layer
      this.openButton = this._$openButton($layer).get(0)
      this.parentLayer = this._$parentLayer($layer).get(0)
      this.beforeLayer = this._$beforeLayer($layer).get(0)
      
      let $parentLayer = null
  
      if (target) {
        $parentLayer = this._$parentLayer($(target).closest(this.defaultLayerName))
      } else {
        $parentLayer = this._$parentLayer($layer)
      }
  
      // open된 팝업 수와 body 고정 유무 체크 후, body 고정 해제
      this.unfix()
  
      // 현재 닫은 팝업은 active 삭제
      $layer.removeClass(this.activeClass)
  
      // 팝업 종류 체크하여 Close
      this.togglePopup($layer, 'close')
  
      // 팝업 열었던 버튼으로 초점 이동
      if (this._$openButton($layer).length) this._$openButton($layer).focus()
      
      // 닫은 팝업의 open 버튼이 또다른 팝업 안에 존재 한다면
      if ($parentLayer.length) {
        $parentLayer.addClass(this.activeClass) // 현재 팝업에 active 클래스 추가
        this.currentLayer = $parentLayer // 팝업 초기화
        this.focusFirstElement(this.currentLayer) // 현재 팝업 첫번째 초점에 초점이동
      } else {
        this.currentLayer = null
      }
  
      this._executeCallback(this, 'afterClose') // 콜백
    }
  
    focusFirstElement($layer) {
      const $focusable = $layer.find(this.focusableSelectors.join()).not('[disabled], [tabindex="-1"], :hidden')
      this.fstTab = $focusable[0]
      this.lstTab = $focusable[$focusable.length - 1]
  
      if (this.fstTab === this.lstTab) {
        this.lstTab = null
      }
      if (this.fstTab) this.fstTab.focus()
    }
  
    _executeCallback(self, action) {
      if (this.callbacks[action]) {
        this.callbacks[action].forEach(callback => callback(self))
      }
    }
  }
  
  new LayerComm('.layer_comm')
})();
