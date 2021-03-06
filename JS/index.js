(function () {
	var State = {
		currentPageNum: 1,
		pageSum: 0
	}
	var Dom = {
		browserWidth: document.documentElement.clientWidth || document.body.clientWidth,
		nav: document.getElementById('m-nav'),
	}

	// 设置showBar大小和定位,菜单栏键点击事件
	var init = function () {
		var showBar = document.getElementById('m-showBar');
		var browserHeight = document.documentElement.clientHeight || document.body.clientHeight;
		if (Dom.browserWidth >= 800) {
			var top = browserHeight * .17 - 70;
			var showBarHeight = browserHeight * .66;
			showBar.style.height = showBarHeight + 'px';
			showBar.style.top = top + 'px';
			showBar.style.marginBottom = browserHeight * .17 + top + 'px';
		}

		if (Dom.browserWidth <= 650) {
			Dom.nav.onclick = function () {
				Dom.nav.getElementsByTagName('ul')[0].style.display = 'block';
				Dom.nav.style.background = 'none';
			}
		}

		readerModel('article');
		readerModel('img');
	}
	
	// 读取文章概览
	var readerModel = function (type) {
		var request = new XMLHttpRequest();
		if(type === 'article'){
			request.open('GET','./data/article.json',true);
			request.send();
			request.onreadystatechange = function() {
	     		if (request.readyState === 4 && request.status === 200) {
	          		var content = JSON.parse(request.responseText);
	          		readerUI(content);
		     	}
			}
		} else if(type === 'img'){
			request.open('GET','./data/imgUrl.json',true);
			request.send();
			request.onreadystatechange = function() {
	     		if (request.readyState === 4 && request.status === 200) {
	          		var content = JSON.parse(request.responseText);
	          		showBarPics(content);
		     	}
			}
		}
	}

	// 拿到图片后装入图片框架中
	var showBarPics = function (imgs) {
		var imgs = imgs.url;
		// 获取实际宽度，而不是css设置的宽度
		var picWidth = parseFloat(window.getComputedStyle(document.getElementById('m-showBar-tab')).getPropertyValue('width'));
		var picsLength = imgs.length * picWidth;
		for (var i = 0; i <= imgs.length - 1; i++) {
			var pic = document.createElement('img');
			pic.src = imgs[i];
			pic.style.left = '-' + picWidth*i + 'px';
			document.getElementById('m-showBar-tab-pic').appendChild(pic);
		}

		// 轮播动画
		var picFrame = document.getElementById('m-showBar-tab-pic');
		var maxDistance = picsLength - picWidth;
		var maxTimes = (picsLength/picWidth-1) * 500;
		var maxTime = (picsLength/picWidth-1) * 5000;
		var showBarAnimation = function () {
			picFrame.animation('move',maxDistance,maxTime,maxTimes,function () {
				picFrame.style.left = '0px';
				showBarAnimation();
			});
		};
		showBarAnimation();
	}

	// 添加文章预览，列表
	var readerUI = function (content){
		State.pageSum = Math.ceil(content.amount/5);
		// 添加文章简介
		for (var j = 0; j <= State.pageSum-1; j++) {
			var amount = content.amount > 5*(j+1) ? 5 : content.amount - 5 * j;
			var text = document.createElement('div');
			text.className = 'm-text';
			text.id = 'm-text_' + (j+1);
			if (j !== 0) {
				text.style.display = 'none';

				// 添加页数
				var pageNumber = document.createElement('li');
				pageNumber.id = 'page-' + (j+1);
				pageNumber.innerHTML = '<a>' + (j + 1) + '</a>';
				document.getElementById('m-pageNumber-ul').insertBefore(pageNumber,document.getElementById('page-old'));
			}
			document.getElementsByTagName('body')[0].insertBefore(text,document.getElementById('m-pageNumber'));

			for (var i =  0; i <= amount - 1; i++) {
				var block = document.createElement('div');
				block.className = 'm-text-block m-text-block_' + (i+1);
				block.style.visibility = 'hidden';
				document.getElementById('m-text_' + (j+1)).appendChild(block);

				// 添加日期
				var textDate = document.createElement('div');
				textDate.className = 'm-text-date';
				block.appendChild(textDate);

				var date_d = document.createElement('div');
				date_d.className = 'm-text-date-d';
				date_d.id = 'm-text-date-d';
				date_d.innerText = content.date_d[i];
				textDate.appendChild(date_d);

				var date_m = document.createElement('div');
				date_m.className = 'm-text-date-m';
				date_m.id = 'm-text-date-m';
				date_m.innerText = content.date_m[i] + ' ' + content.date_y[i];
				textDate.appendChild(date_m);

				// 添加文章预览
				var textBlk = document.createElement('div');
				textBlk.className = 'm-text-outline';
				block.appendChild(textBlk);

				var textTitle = document.createElement('div');
				textTitle.className = 'm-text-title';
				textTitle.id = 'm-text-title';
				textTitle.innerHTML = ' <a href=" ' + content.url[i] + ' "> ' + content.title[i] + '</a>';
				textBlk.appendChild(textTitle);

				var textContent = document.createElement('div');
				textContent.className = 'm-text-content';
				textContent.id = 'm-text-content';
				textContent.innerHTML = content.content[i];
				textBlk.appendChild(textContent);

				if(amount<=2 && i<=amount-1){
					var block = document.createElement('div');
					block.className = 'm-text-block no-more m-text-block_' + (i+2);
					block.style.visibility = 'hidden';
					document.getElementById('m-text_' + (j+1)).appendChild(block);
				}
			}
		}
		showTextBlock();
	}
	
	// 显示textblock
	var showTextBlock = function () {
		var textBody = document.getElementById('m-text_1');
		var textBodyTop = textBody.offsetTop;
		var textBlockHeight = parseInt(window.getComputedStyle(textBody).height) / 5;

		var text_block_1 = document.getElementsByClassName('m-text-block_1');
		var text_block_2 = document.getElementsByClassName('m-text-block_2');
		var text_block_3 = document.getElementsByClassName('m-text-block_3');
		var text_block_4 = document.getElementsByClassName('m-text-block_4');
		var text_block_5 = document.getElementsByClassName('m-text-block_5');

		var m = showTextBlockInitial();

		window.onscroll = function () {
			// 菜单栏
			if (Dom.browserWidth < 500) {
				Dom.nav.getElementsByTagName('ul')[0].style.display = 'none';
				Dom.nav.style.background = 'url(./pic/menu.png) 100% 100% / contain no-repeat';
			}

			// 文章预览
			var top = document.documentElement.scrollTop || document.body.scrollTop;
			if (top > textBlockHeight*4 - m){
				for (var i = text_block_5.length - 1; i >= 0; i--) {
					text_block_5[i].style.visibility = 'visible';
					text_block_5[i].animation('opacity',1,1000,100);
				}
			} else if (top > textBlockHeight*3 - m){
				for (var i = text_block_4.length - 1; i >= 0; i--) {
					text_block_4[i].style.visibility = 'visible';
					text_block_4[i].animation('opacity',1,1000,100);
				}
			} else if (top > textBlockHeight*2 - m){
				for (var i = text_block_3.length - 1; i >= 0; i--) {
					text_block_3[i].style.visibility = 'visible';
					text_block_3[i].animation('opacity',1,1000,100);
				}
			} else if (top > textBlockHeight*1 - m){
				for (var i = text_block_2.length - 1; i >= 0; i--) {
					text_block_2[i].style.visibility = 'visible';
					text_block_2[i].animation('opacity',1,1000,100);
				}
			} else if (top > 0) {
				for (var i = text_block_1.length - 1; i >= 0; i--) {
					text_block_1[i].style.visibility = 'visible';
					text_block_1[i].animation('opacity',1,1000,100);	
				}
			}
		}
		changePage();
	}

	var showTextBlockInitial = function () {
		// 首先判断屏幕高度是否比m-text的offsetTop高
		var textBody = document.getElementById('m-text_' + State.currentPageNum);
		var textBodyTop = textBody.offsetTop;
		var textBlockHeight = parseInt(window.getComputedStyle(textBody).height) / 5;
		var browserHeight = document.documentElement.clientHeight || document.body.clientHeight;

		var text_block_1 = document.getElementsByClassName('m-text-block_1');
		var text_block_2 = document.getElementsByClassName('m-text-block_2');
		var text_block_3 = document.getElementsByClassName('m-text-block_3');
		var text_block_4 = document.getElementsByClassName('m-text-block_4');
		var text_block_5 = document.getElementsByClassName('m-text-block_5');

		if(textBodyTop < browserHeight){
			var m = browserHeight - textBodyTop;
			if (m > textBlockHeight*4){
				for (var i = text_block_5.length - 1; i >= 0; i--) {
					text_block_5[i].style.visibility = 'visible';
					text_block_5[i].style.opacity = 1;
				}
			}
			if (m > textBlockHeight*3){
				for (var i = text_block_4.length - 1; i >= 0; i--) {
					text_block_4[i].style.visibility = 'visible';
					text_block_4[i].style.opacity = 1;
				}
			} 
			if (m > textBlockHeight*2){
				for (var i = text_block_3.length - 1; i >= 0; i--) {
					text_block_3[i].style.visibility = 'visible';
					text_block_3[i].style.opacity = 1;
				}
			}
			if (m > textBlockHeight){
				for (var i = text_block_2.length - 1; i >= 0; i--) {
					text_block_2[i].style.visibility = 'visible';
					text_block_2[i].style.opacity = 1;
				}
			}
			if (m > 0) {
				for (var i = text_block_1.length - 1; i >= 0; i--) {
					text_block_1[i].style.visibility = 'visible';
					text_block_1[i].style.opacity = 1;
				}
			}
		}
		return m;
	}

	// 翻页功能
	var changePage = function() {
		// 翻页功能
		document.getElementById('page-old').onclick = function(){
			if (State.currentPageNum < State.pageSum) {
				var blockAll = document.getElementsByClassName('m-text-block');
				
					for (var i = blockAll.length - 1; i >= 0; i--) {
						blockAll[i].style.visibility = 'hidden';
						blockAll[i].style.opacity = 0;
					}	
				document.documentElement.scrollTop = 0;
				document.body.scrollTop = 0;
				document.getElementById('m-text_'+State.currentPageNum).style.display = 'none';
				document.getElementById('m-text_'+(State.currentPageNum+1)).style.display = 'block';
				State.currentPageNum++;
				showTextBlockInitial();
			}
		}
		document.getElementById('page-new').onclick = function(){
			if (State.currentPageNum > 1) {
				var blockAll = document.getElementsByClassName('m-text-block');
				for (var i = blockAll.length - 1; i >= 0; i--) {
					blockAll[i].style.visibility = 'hidden';
					blockAll[i].style.opacity = 0;
				}
				document.documentElement.scrollTop = 0;
				document.body.scrollTop = 0;
				document.getElementById('m-text_'+State.currentPageNum).style.display = 'none';
				document.getElementById('m-text_'+(State.currentPageNum-1)).style.display = 'block';
				State.currentPageNum--;
				showTextBlockInitial();
			}
		}
		for (var i = State.pageSum - 1; i >= 0; i--) {
			var pageTo = function(i){
				return function (){
					if (State.currentPageNum !== (i+1)) {
						var blockAll = document.getElementsByClassName('m-text-block');
						for (var j = blockAll.length - 1; j >= 0; j--) {
							blockAll[j].style.visibility = 'hidden';
							blockAll[j].style.opacity = 0;
						}
						document.documentElement.scrollTop = 0;
						document.body.scrollTop = 0;
						document.getElementById('m-text_' + State.currentPageNum).style.display = 'none';
						document.getElementById('m-text_'+(i+1)).style.display = 'block';
						State.currentPageNum=(i+1);
						showTextBlockInitial();
					}
				}
			}
			document.getElementById('page-'+(i+1)).onclick = pageTo(i);
		}
		heart();
	}

	// 心跳
	var heart = function() {
		var heart = document.getElementById('bottom-heart');
		
		var small = function(){
			heart.animation('scale',-0.2,500,200,big);
		}
		var big = function(){
			heart.animation('scale',0.25,1000,250,small);
		}
		big();
		return{
			small : small,
			big : big
		}
	}

	// loading动画
	var loading = function () {
		var readyNum = 0;
		var readyArr = [];
		var arr = ['./pic/showBar_1.jpg','./pic/showBar_2.jpg','./pic/showBar_1.jpg','./pic/heart.png','./pic/about.png','./pic/about_bkg.png','./pic/star.png','./pic/starb.png','./pic/weibo.png'];
		var loader = function () {
			if(readyNum < arr.length) {
				readyArr[readyNum] = new Image();
				readyArr[readyNum].onload = function () {
					readyNum++;
					document.getElementById('loading').style.width = readyNum / arr.length * 100 + '%';
					loader();
				}
				readyArr[readyNum].src = arr[readyNum];
			}else{
				document.getElementById('loading').style.width = 0;
				document.body.scrollTop = 0;
				document.documentElement.scrollTop = 0;
			}	
		}
		loader();
	}	

	// 第一程序
	loading();	
	init();
})();