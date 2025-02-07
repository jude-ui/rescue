"use strict";

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
        'Authorization': 'KakaoAK 49fe230c6fcd8c55afb8200126317160'
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
    searchDetailAddrFromCoords(mouseEvent.latLng, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        var detailAddr = !!result[0].road_address ? `<div class="address">도로명주소 : ${result[0].road_address.address_name}</div>` : '';
        detailAddr += `<div class="address">지번 주소 : ${result[0].address.address_name}</div>`;
        
        var content = `<div class="info_marker">
                        ${detailAddr}
                      </div>`;

        // 마커를 클릭한 위치에 표시합니다 
        marker.setPosition(mouseEvent.latLng);
        marker.setMap(map);

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
    });
  });

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