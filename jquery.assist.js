var __currentDir = function() {
    var root;
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
        var match = scripts[i].src.match(/(^|.*\/)jquery.assist.js$/);
        if (match) {
            root = match[1].replace(/\/$/, '');
            break;
        }
    }
    return root;
};

(function() {
    var defaults = {};
    var errorList = {};
    
    var alertChip = {};
    
    //郵便番号アシスト関連設定項目
    var ZIP_TYPE_JSON  = 0; //JSON形式（Ajax）
    var ZIP_TYPE_API   = 1; //API形式（Ajax）
    var ZIP_TYPE_JSONP = 2; //JSONP形式（scriptタグ読み込み）
    
    defaults.zip_type  = ZIP_TYPE_JSON; //郵便番号アシストモード
    defaults.api_url   = '/zip_json/index.php?mode=json'; //Ajaxモードの場合のAPIのURL
    defaults.jsonp_url = '/zip_json/index.php?mode=jsonp&zipcode='; //JSONPモードの場合のAPIのURL
    
    var isLoadingJsonp = false;
    
    //ひらがな一覧
    var aryHiragana = ["が", "ぎ", "ぐ", "げ", "ご",
                       "ざ", "じ", "ず", "ぜ", "ぞ",
                       "だ", "ぢ", "づ", "で", "ど",
                       "ば", "び", "ぶ", "べ", "ぼ",
                       "ぱ", "ぴ", "ぷ", "ぺ", "ぽ",
                       "ヴ",
                       "あ", "い", "う", "え", "お",
                       "か", "き", "く", "け", "こ",
                       "さ", "し", "す", "せ", "そ",
                       "た", "ち", "つ", "て", "と",
                       "な", "に", "ぬ", "ね", "の",
                       "は", "ひ", "ふ", "へ", "ほ",
                       "ま", "み", "む", "め", "も",
                       "や", "ゆ", "よ",
                       "ら", "り", "る", "れ", "ろ",
                       "わ", "を", "ん",
                       "ぁ", "ぃ", "ぅ", "ぇ", "ぉ",
                       "ゃ", "ゅ", "ょ",
                       "、", "。", "ー", "〜", "゛", "゜", "　"];
    
    //全角カタカタ一覧
    var aryZenKana  = ["ガ", "ギ", "グ", "ゲ", "ゴ",
                       "ザ", "ジ", "ズ", "ゼ", "ゾ",
                       "ダ", "ヂ", "ヅ", "デ", "ド",
                       "バ", "ビ", "ブ", "ベ", "ボ",
                       "パ", "ピ", "プ", "ペ", "ポ",
                       "ヴ",
                       "ア", "イ", "ウ", "エ", "オ",
                       "カ", "キ", "ク", "ケ", "コ",
                       "サ", "シ", "ス", "セ", "ソ",
                       "タ", "チ", "ツ", "テ", "ト",
                       "ナ", "ニ", "ヌ", "ネ", "ノ",
                       "ハ", "ヒ", "フ", "ヘ", "ホ",
                       "マ", "ミ", "ム", "メ", "モ",
                       "ヤ", "ユ", "ヨ",
                       "ラ", "リ", "ル", "レ", "ロ",
                       "ワ", "ヲ", "ン",
                       "ァ", "ィ", "ゥ", "ェ", "ォ",
                       "ャ", "ュ", "ョ",
                       "、", "。", "ー", "〜", "゛", "゜", "　"];
    
    //半角カタカナ一覧
    var aryHalfKana = ["ｶﾞ", "ｷﾞ", "ｸﾞ", "ｹﾞ", "ｺﾞ",
                       "ｻﾞ", "ｼﾞ", "ｽﾞ", "ｾﾞ", "ｿﾞ",
                       "ﾀﾞ", "ﾁﾞ", "ﾂﾞ", "ﾃﾞ", "ﾄﾞ",
                       "ﾊﾞ", "ﾋﾞ", "ﾌﾞ", "ﾍﾞ", "ﾎﾞ",
                       "ﾊﾟ", "ﾋﾟ", "ﾌﾟ", "ﾍﾟ", "ﾎﾟ",
                       "ｳﾞ",
                       "ｱ", "ｲ", "ｳ", "ｴ", "ｵ",
                       "ｶ", "ｷ", "ｸ", "ｹ", "ｺ",
                       "ｻ", "ｼ", "ｽ", "ｾ", "ｿ",
                       "ﾀ", "ﾁ", "ﾂ", "ﾃ", "ﾄ",
                       "ﾅ", "ﾆ", "ﾇ", "ﾈ", "ﾉ",
                       "ﾊ", "ﾋ", "ﾌ", "ﾍ", "ﾎ",
                       "ﾏ", "ﾐ", "ﾑ", "ﾒ", "ﾓ",
                       "ﾔ", "ﾕ", "ﾖ",
                       "ﾗ", "ﾘ", "ﾙ", "ﾚ", "ﾛ",
                       "ﾜ", "ｦ", "ﾝ",
                       "ｧ", "ｨ", "ｩ", "ｪ", "ｫ",
                       "ｬ", "ｭ", "ｮ",
                       "､", "､", "ｰ", "~", "ﾞ", "ﾟ", " "];
    
    //全角英字一覧
    var aryZenAlp   = ["Ａ", "Ｂ", "Ｃ", "Ｄ", "Ｅ",
                       "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ",
                       "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ",
                       "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ",
                       "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ",
                       "ａ", "ｂ", "ｃ", "ｄ", "ｅ",
                       "ｆ", "ｇ", "ｈ", "ｉ", "ｊ",
                       "ｋ", "ｌ", "ｍ", "ｎ", "ｏ",
                       "ｐ", "ｑ", "ｒ", "ｓ", "ｔ",
                       "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ",
                       "＠", "．", "‐", "−", "＿", "（", "）"];
    
    //半角英字一覧
    var aryHalfAlp  = ["A", "B", "C", "D", "E",
                       "F", "G", "H", "I", "J",
                       "K", "L", "M", "N", "O",
                       "P", "Q", "R", "S", "T",
                       "U", "V", "W", "X", "Y", "Z",
                       "a", "b", "c", "d", "e",
                       "f", "g", "h", "i", "j",
                       "k", "l", "m", "n", "o",
                       "p", "q", "r", "s", "t",
                       "u", "v", "w", "x", "y", "z",
                       "@", ".", "-", "-", "_", "(", ")"];
    
    //全角数字一覧
    var aryZenNum   = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    
    //半角数字一覧
    var aryHalfNum  = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    
    //都道府県
    var aryPrefecture = ["北海道",
                         "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
                         "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
                         "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
                         "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
                         "鳥取県", "島根県", "岡山県", "広島県", "山口県",
                         "徳島県", "香川県", "愛媛県", "高知県",
                         "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県",
                         "沖縄県"];
    
    var zip       = null; //郵便番号
    var zip1      = null; //郵便番号上３桁
    var zip2      = null; //郵便番号下４桁
    var zipcode   = '';
    
    var tel       = null; //電話番号
    var tel1      = null; //市外局番
    var tel2      = null; //市内局番
    var tel3      = null; //加入者番号
    var telnumber = '';
    
    var pref      = null; //都道府県
    var city      = null; //市区町村
    var address   = null; //住所
    
    var aryZipJson = [];
    
    //住所選択VIEW
    var divZipAssist = $('<div />').css('position', 'absolute')
                                   .css('backgroundColor', '#000000')
                                   .css('opacity', '0.8')
                                   .css('padding', '5px')
                                   .css('-webkit-border-radius', '6px')
                                   .css('-moz-border-radius', '6px')
                                   .css('-ms-border-radius', '6px')
                                   .css('-o-border-radius', '6px')
                                   .css('border-radius', '6px')
                                   .css('color', '#FFFFFF')
                                   .css('fontSize', '12px')
                                   .css('zIndex', '1000')
                                   .css('overflow', 'scroll')
                                   .css('overflowX', 'hidden')
                                   .hide()
                                   .appendTo('body');
    
    //検索件数表示VIEW
    var divZipCount  = $('<div />').css('textAlign', 'center')
                                   .appendTo(divZipAssist);
    
    //住所一覧VIEW
    var ulZipList    = $('<ul />').css('margin', '0px')
                                  .css('maxHeight', '320px')
                                  .appendTo(divZipAssist);
    
    //住所表示枠VIEW
    var liZipList    = function() {
        return $('<li />').css('listStyle', 'none')
                          .css('padding', '2px')
                          .css('margin' , '1px');
    }
    
    //住所リンクVIEW
    var aZipList     = function() {
        return $('<a />').css('display', 'block')
                         .css('color', '#FFFFFF');
    }
    
    var divAlertChip = function(message, top, left) {
        var d = $('<div />').css('position', 'absolute')
                            .css('left', left + 'px')
                            .css('maxHeight', '64px')
                            .css('maxWidth', '200px')
                            .css('backgroundColor', '#000000')
                            .css('alpha','0.8')
                            .css('-webkit-border-radius', '6px')
                            .css('-moz-border-radius', '6px')
                            .css('-ms-border-radius', '6px')
                            .css('-o-border-radius', '6px')
                            .css('border-radius', '6px')
                            .css('color', '#FFFFFF')
                            .css('zIndex', '1000')
                            .css('fontSize', '12px')
                            .css('padding', '2px')
                            .text(message)
                            .hide()
                            .appendTo('body');
         
         $(d).css('top', (top - ($(d).height() + 6)) + 'px');
         
         return d;
    }
    
    //固定表示VIEW設定
    var defaultFixedTop  = $(window).scrollTop() + 'px'; //固定表示初期位置(TOP)
    var defaultFixedLeft = $(window).scrollLeft() + 'px'; //固定表示初期位置(LEFT)
    
    var divFixedMessage = $('<div />').css('position', 'absolute')
                                      .css('top', defaultFixedTop)
                                      .css('left', defaultFixedLeft)
                                      .css('width', '140px')
                                      .css('backgroundColor', '#000000')
                                      .css('textAlign', 'center')
                                      .css('color', '#FFFFFF')
                                      .css('fontWeight', 'bold')
                                      .css('opacity', '0.8')
                                      .css('padding', '10px')
                                      .css('-webkit-border-radius', '6px')
                                      .css('-moz-border-radius', '6px')
                                      .css('-ms-border-radius', '6px')
                                      .css('-o-border-radius', '6px')
                                      .css('border-radius', '6px')
                                      .css('fontSize', '12px')
                                      .css('zIndex', '1000');
    
    //関数集
    var f = {};
    
    //◯◯pxを数字に変換
    var pxToNum = function(px) {
        return Number(px.replace('px', ''));
    }
    
    $.fn.assist = function(config) {
        //初期設定
        var _defaultErrorBgcolor     = '#FFEEEE';               //エラー時背景色
        var _defaultNormalBgcolor    = '#FFFFFF';               //通常時背景色
        var _defaultShowFixedMessage = false;                   //固定メッセージの表示
        var _defaultFixedMessage     = 'atFormAssistMessage';   //固定メッセージ文言
        var _defaultShowAlertChip    = false;
        
        defaults.dir       = __currentDir();
        defaults.json_dir  = defaults.dir + '/json'; //JSONモードの場合のJSON保存ディレクトリ
        
        defaults.element = this;
        
        //バリデーション関数
        f.check = function(el, valid, showError) {
            var bool;
            if ( (undefined != valid.required && true == valid.required ) ) {
                bool = f.notnull(el);
                f.changeBgcolor(el, bool, showError);
            } else if (false == valid.required) {
                bool = f.notnull(el);
                
                if ( false == bool ) {
                    if ( valid.relation != undefined ) {
                        var relation = $(':input[name=' + valid.relation + ']');
                        relation.bind('change blur', {element: el, valid: valid, showError:showError}, function(e) {
                            f.check(e.data.element, e.data.valid, e.data.showError);
                        });
                        
                        var relationVal = relation.val();
                        if ( undefined != relationVal && 0 == relationVal.length ) {
                            bool = false;
                        } else {
                            bool = true;
                        }
                    } else {
                        bool = true;
                    }
                }
                
                f.changeBgcolor(el, bool, showError);
            }
            
            if ( true == bool ) {
                if ( undefined != valid.max ) {
                    var val = $(el).val();
                    $(el).val( val.substring(0, valid.max) );
                }
                
                if ( undefined != valid.type && undefined != f[valid.type] ) {
                    bool = (f[valid.type])(el);
                    f.changeBgcolor(el, bool, showError);

                    if ( 'zip1' == valid.type || 'zip2' == valid.type ) {
                        
                        var _bool = false;
                        if ( 'zip1' == valid.type ) {
                            _bool = f.zip2(zip2);
                        } else if ( 'zip2' == valid.type ) {
                            _bool = f.zip1(zip1);
                        }
                        
                        if ( bool && _bool ) {
                            bool = f.zip();
                            f.changeBgcolor(zip1, bool, showError);
                            f.changeBgcolor(zip2, bool, showError);
                        }
                    } else if ( 'tel1' == valid.type || 'tel2' == valid.type || 'tel3' == valid.type ) {
                        bool = f.telCheck();

                        f.changeBgcolor(tel1, bool, showError);
                        f.changeBgcolor(tel2, bool, showError);
                        f.changeBgcolor(tel3, bool, showError);
                    }
                }
            }
            
            if (! bool) {
                errorList[valid.name] = valid.message;
            } else {
                if (typeof errorList[valid.name] != 'undefined') {
                    delete errorList[valid.name];
                }
            }
            
            var errorCount = 0;
            for (var key in errorList) {
                errorCount++;
            }
            
            if (typeof atFormAssistDidCheck == 'function') {
                atFormAssistDidCheck( errorCount );
            }
        }
        
        //背景色変更
        f.changeBgcolor = function(el, bool, showAlert) {
            if (bool) {
                $(el).css('backgroundColor', defaults.config.normalBgcolor);
            } else {
                $(el).css('backgroundColor', defaults.config.errorBgcolor);
            }
            
            var alertName = 'alert_' + $(el).attr('name');
            var chip = alertChip[alertName];
            if ( undefined != showAlert && undefined != chip ) {
                if ( true == showAlert ) {
                    if ( bool ) {
                        $(chip).fadeOut('fast');
                    } else {
                        $(chip).fadeIn('fast', function() {
                            var elm = this;
                            setTimeout(function() {
                                $(elm).fadeOut('fast');
                            }, 3000);
                        });
                    }
                } else {
                    $(chip).hide();
                }
            } else if ( undefined == showAlert ) {
                $(chip).hide();
            }
        }
        
        //未入力チェック
        f.notnull = function(el) {
            var val = $(el).val();
            
            return 0 != val.length;
        }
        
        //全角カナチェック
        f.zenkana = function(el) {
            var val = $(el).val();
            var result = false;
            
            if ( null != val.match(/^[ァ-ヶー]+$/) ) {
                result = true;
            }
            
            return result;
        }
        
        //半角カナチェック
        f.halfkana = function(el) {
            var val = $(el).val();
            var result = false;
            
            if ( null != val.match(/^[ｧ-ﾝﾞﾟ]+$/) ) {
                result = true;
            }
            
            return result;
        }
        
        //ひらがなチェック
        f.hiragana = function(el) {
            var val = $(el).val();
            var result = false;
            
            if ( null != val.match(/^[ぁ-ん]+$/) ) {
                result = true;
            }
            
            return result;
        }
        
        //メールアドレス
        f.email = function(el) {
            var val = $(el).val();
            if ( null != val.match(/^[a-zA-Z0-9\-_\.!\"#\$%&'\(\)\=\^\|\[\]\{\}\?<>\+]+@([a-zA-Z0-9\-_\.]+\.[a-zA-Z0-9\-_\.]+)$/) ) {
                return true;
            }

            return false;
        }
        
        //郵便番号上3桁
        f.zip1 = function(el) {
            zip1 = el;
            
            var val = $(el).val();
            if ( null != val.match(/^[0-9]{3}$/) ) {
                return true;
            }
            
            return false;
        }
        
        //郵便番号上4桁
        f.zip2 = function(el) {
            zip2 = el;
            
            var val = $(el).val();
            if ( undefined != val && null != val.match(/^[0-9]{4}$/) ) {
                return true;
            }
            
            return false;
        }
        
        //郵便番号
        f.zip = function(el) {
            var val;
            if ( typeof el == 'undefined' ) {
                val = $(zip1).val() + '-' + $(zip2).val();
            } else if ( typeof el == 'object' ) {
                zip = el;
                val = $(el).val();
            }
            
            if ( null != val.match(/^[0-9]{3}\-[0-9]{4}$/) ) {
                return true;
            }
            
            return false;
        }
        
        //電話番号1
        f.tel1 = function(el) {
            tel1 = el;
            
            var val = $(el).val();
            if ( null != val.match(/^[0-9]{,4}$/) ) {
                return true;
            }
            
            return false;
        }
        
        //電話番号2
        f.tel2 = function(el) {
            tel2 = el;
            
            var val = $(el).val();
            if ( null != val.match(/^[0-9]{,4}$/) ) {
                return true;
            }
            
            return false;
        }
        
        //電話番号3
        f.tel3 = function(el) {
            tel3 = el;
            
            var val = $(el).val();
            if ( null != val.match(/^[0-9]{,4}$/) ) {
                return true;
            }
            
            return false;
        }
        
        //電話番号チェック（結合）
        f.tel = function(el) {
            tel = el;
            
            var val = $(el).val();
            var aryTelNumber = val.match(/^([0-9]{1,4})\-([0-9]{1,4})\-([0-9]{3,4})$/);
            if ( aryTelNumber != null ) {
                var _tel1 = aryTelNumber[1];
                var _tel2 = aryTelNumber[2];
                var _tel3 = aryTelNumber[3];
                
                var sumLength = _tel1.length + _tel2.length + _tel3.length;
                if ( 10 <= sumLength && 11 >= sumLength ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        
        //電話番号チェック（分割）
        f.telCheck = function() {
            if ( null != tel1 && null != tel2 && null != tel3 ) {
                var _tel1 = $(tel1).val();
                var _tel2 = $(tel2).val();
                var _tel3 = $(tel3).val();
                
                if ( f.tel1(tel1) && f.tel2(tel2) && f.tel3(tel3) ) {
                    var sumLength = _tel1.length + _tel2.length + _tel3.length;
                    if ( 10 <= sumLength && 11 >= sumLength ) {
                        return true;
                    }
                }
            }
            
            return false;
        }
        
        //都道府県
        f.pref = function(el) {
            pref = el;
            var result = false;
            
            for ( var i = 0; i < aryPrefecture.length; i++ ) {
                if ( 'SELECT' == $(el).get(0).tagName ) {
                    if ( aryPrefecture[i] == $('option:selected', el).text() ) {
                        result = true;
                    }
                } else {
                    if ( aryPrefecture[i] == $(el).val() ) {
                        result = true;
                    }
                }
            }
            
            return result;
        }
        
        //ひらがな、半角カナを全角カナに変換（入力出来ない値は削除）
        f.convertZenkana = function(el) {
            var regex;
            var val = $(el).val();
            for (var i = 0; i < aryHiragana.length; i++) {
                regex = new RegExp(aryHiragana[i], 'g');
                val = val.replace(regex, aryZenKana[i]);

                regex = new RegExp(aryHalfKana[i], 'g');
                val = val.replace(regex, aryZenKana[i]);
            }

            var aryStr = val.split('');
            for (var j = 0; j < aryStr.length; j++) {
                if (-1 == $.inArray(aryStr[j], aryZenKana) ) {
                    val = val.replace(aryStr[j], '');
                }
            }

            $(el).val(val);
        }
        
        //ひらがな、全角カナを半角カナに変換（入力出来ない値は削除）
        f.convertHalfkana = function(el) {
            var regex;
            var val = $(el).val();
            for (var i = 0; i < aryHiragana.length; i++) {
                regex = new RegExp(aryHiragana[i], 'g');
                val = val.replace(regex, aryHalfKana[i]);

                regex = new RegExp(aryZenKana[i], 'g');
                val = val.replace(regex, aryHalfKana[i]);
            }

            var aryStr = val.split('');
            for (var j = 0; j < aryStr.length; j++) {
                if (-1 == $.inArray(aryStr[j], aryHalfKana) ) {
                    val = val.replace(aryStr[j], '');
                }
            }

            $(el).val(val);
        }
        
        //全角カナ、半角カナをひらがなに変換（入力出来ない値は削除）
        f.convertHiragana = function(el) {
            var regex;
            var val = $(el).val();
            for (var i = 0; i < aryHiragana.length; i++) {
                regex = new RegExp(aryHalfKana[i], 'g');
                val = val.replace(regex, aryHiragana[i]);

                regex = new RegExp(aryZenKana[i], 'g');
                val = val.replace(regex, aryHiragana[i]);
            }

            var aryStr = val.split('');
            for (var j = 0; j < aryStr.length; j++) {
                if (-1 == $.inArray(aryStr[j], aryHiragana) ) {
                    val = val.replace(aryStr[j], '');
                }
            }

            $(el).val(val);
        }
        
        //全角英数字が入力されている場合半角英数字に変換
        f.convertEmail = function(el) {
            var regex;
            var val = $(el).val();
            
            for (var i = 0; i < aryZenAlp.length; i++) {
                regex = new RegExp(aryZenAlp[i], 'g');
                val = val.replace(regex, aryHalfAlp[i]);
            }
            
            for (var j = 0; j < aryZenNum.length; j++) {
                regex = new RegExp(aryZenNum[j], 'g');
                val = val.replace(regex, aryHalfNum[j]);
            }
            
            $(el).val(val);
        }
        
        //全角数字を半角数字に変換（半角数字以外は削除）
        f.convertDigit = function(el) {
            var regex;
            var val = $(el).val();
            
            for (var i = 0; i < aryZenNum.length; i++) {
                regex = new RegExp(aryZenNum[i], 'g');
                val = val.replace(regex, aryHalfNum[i]);
            }
            
            var aryStr = val.split('');
            for (var j = 0; j < aryStr.length; j++) {
                if (-1 == $.inArray(aryStr[j], aryHalfNum) ) {
                    val = val.replace(aryStr[j], '');
                }
            }
            
            $(el).val(val);
        }
        
        //郵便番号入力補助準備
        f.zipAssist = function(el, valid) {
            var _zip1 = '', _zip2 = '';
            if ( 'zip1' == valid.type ) {
                zip1 = el;
                _zip1 = $(zip1).val();
                
                if (null != zip2) {
                    _zip2 = $(zip2).val();
                }
            } else if ( 'zip2' == valid.type ) {
                zip2 = el;
                _zip2 = $(zip2).val();
                
                if ( null != zip1 ) {
                    _zip1 = $(zip1).val();
                }
            } else if ( 'zip' == valid.type ) {
                zip = el;
                aryZip = $(el).val().split('-');
                _zip1 = aryZip[0];
                _zip2 = aryZip[1];
            }
            
            if ( ('zip1' == valid.type || 'zip' == valid.type) && null != _zip1.match(/^[0-9]{3}$/) ) {
                if ( zip2 != null ) {
                    $(zip2).focus();
                }
                
                if ( ZIP_TYPE_JSONP != defaults.zip_type ) {
                    var zipUrl = defaults.zip_type == ZIP_TYPE_API ? defaults.api_url : defaults.json_dir + '/' + _zip1 + '.json';
                    
                    $.ajax({
                        url : zipUrl,
                        type: 'get',
                        dataType: 'json',
                        data: 'zipcode=' + _zip1 + _zip2,
                        success: function(json) {
                            aryZipJson = json;
                            f.showZipAssist(_zip1, _zip2);
                        }

                    });
                } else {
                    if ( false == isLoadingJsonp ) {
                        isLoadingJsonp = true;
                        $('<script type="text/javascript" />').attr('src', defaults.jsonp_url + _zip1 + _zip2).appendTo('head');
                    }
                }
                
            } else if ( null != _zip1.match(/^[0-9]{3}$/) ) {
                f.showZipAssist(_zip1, _zip2);
            } else {
                aryZipJson = new Array();
                divZipAssist.hide();
            }
        }
        
        //郵便番号入力補助表示
        f.showZipAssist = function(_zip1, _zip2) {
            var regex = new RegExp(_zip1 + '' + _zip2);
            var aryShowZip = new Array();
            
            if ( undefined != aryZipJson.zip_code ) {
                var currentZip;
                for (var i = 0; i < aryZipJson.zip_code.length; i++) {
                    currentZip = aryZipJson.zip_code[i];

                    if ( null != currentZip.zip_code.match(regex) ) {
                        aryShowZip.push(currentZip);
                    }
                }
            }
            
            $(ulZipList).html('');
            
            if ( 0 != aryShowZip.length ) {
                if ( 1 != aryShowZip.length ) {
                    var aryZip;
                    for ( var j = 0; j < aryShowZip.length; j++ ) {
                        currentZip = aryShowZip[j];
                        aryZip = currentZip.zip_code.match(/^([0-9]{3})([0-9]{4})$/);
                        
                        var link = aZipList();
                        link.attr('href', 'javascript:void(0);');
                        link.text('[' + aryZip[1] + '-' + aryZip[2] + ']' + currentZip.pref + currentZip.city + currentZip.address);
                        link.bind('click', currentZip, function(e) {
                            f.insertAddress(e.data);
                        });

                        var list = liZipList();
                        list.append(link).appendTo(ulZipList);
                    }
                    
                    var width = null, height = null, offset = null;
                    if ( null != zip ) {
                        width  = $(zip).width();
                        height = $(zip).height();
                        offset = $(zip).offset();
                    } else if ( null != zip2 ) {
                        width  = $(zip2).width();
                        height = $(zip2).height();
                        offset = $(zip2).offset();
                    }

                    if ( width != null && height != null && offset != null ) {
                        divZipCount.text( '住所検索 ' + aryShowZip.length + ' 件' );
                        
                        divZipAssist.css('top', offset.top + height + 5 + 'px')
                                    .css('left', offset.left + width + 5 + 'px')
                                    .show();

                    }
                } else {
                    f.insertAddress(aryShowZip[0]);
                }
            } else {
                divZipAssist.hide();
            }
        }
        
        //住所情報を挿入
        f.insertAddress = function(address) {
            var aryZip = address.zip_code.match(/^([0-9]{3})([0-9]{4})$/);
            if ( null != zip1 && null != zip2 ) {
                $(zip1).val(aryZip[1]);
                $(zip2).val(aryZip[2]);
                
                f.zip1(zip1);
                f.zip2(zip2);
                
                f.changeBgcolor(zip1, true);
                f.changeBgcolor(zip2, true);
                
                var zip1Name, zip2Name;
                zip1Name = $(zip1).attr('name');
                zip2Name = $(zip2).attr('name');
                
                if ( typeof errorList[zip1Name] != 'undefined' ) {
                    delete errorList[zip1Name];
                }
                
                if ( typeof errorList[zip2Name] != 'undefined' ) {
                    delete errorList[zip2Name];
                }
            } else if ( null != zip ) {
                $(zip).val(aryZip[1] + '-' + aryZip[2]);
                f.zip(zip);
                
                f.changeBgcolor(zip, true);
                
                var zipName = $(zip).attr('name');
                if ( typeof errorList[zipName] != 'undefined' ) {
                    delete errorList[zipName];
                }
            }
            
            if ( null != pref ) {
                
                if ( 'SELECT' == $(pref).get(0).tagName ) {
                    $('option', pref).each( function() {
                        if ( $(this).text() == address.pref ) {
                            $(this).attr('selected', true);
                        } else {
                            $(this).attr('selected', false);
                        }
                    } );
                } else {
                    $(pref).val( address.pref );
                }
                
                f.changeBgcolor(pref, true);
                
                var prefName = $(pref).attr('name');
                if ( typeof errorList[prefName] != 'undefined' ) {
                    delete errorList[prefName];
                }
            }
            
            if ( null != city ) {
                $(city).val(address.city + address.address).change();
                f.changeBgcolor(city, true);
            }
            
            divZipAssist.hide();
        }
        
        //初期チェック実行
        var init = function(_config) {
            defaults.config = _config;
            
            //エラー時背景色設定
            if ( undefined == defaults.config.errorBgcolor ) {
                defaults.config.errorBgcolor = _defaultErrorBgcolor;
            }
            
            //通常時背景色設定
            if ( undefined == defaults.config.normalBgcolor ) {
                defaults.config.normalBgcolor = _defaultNormalBgcolor;
            }
            
            //アラート表示
            if ( undefined == defaults.config.showAlertChip ) {
                defaults.config.showAlertChip = _defaultShowAlertChip;
            }
            
            //固定メッセージの表示設定
            if ( undefined == defaults.config.showFixedMessage ) {
                defaults.config.showFixedMessage = _defaultShowFixedMessage;
            }
            
            //固定メッセージ文言
            if ( undefined == defaults.config.fixedMessage ) {
                defaults.config.fixedMessage = _defaultFixedMessage;
            }
            
            //固定メッセージ
            if ( defaults.config.showFixedMessage ) {
                divFixedMessage.text(defaults.config.fixedMessage).appendTo('body');
                
                
                var scrolledTop       = 0; //windowのスクロールしたピクセル（TOP）
                var scrolledLeft      = 0; //windowのスクロールしたピクセル（LEFT）
                var startPositionX    = 0; //ドラッグ開始時のマウスポジションX
                var startPositionY    = 0; //ドラッグ開始時のマウスポジションY
                var movePositionX     = 0; //ドラッグした分のX
                var movePositionY     = 0; //ドラッグした分のY
                var differenceX       = 0; //ドラッグで移動したDIVのX
                var differenceY       = 0; //ドラッグで移動したDIVのY
                var defaultPositionX  = 0; //ドラッグ開始時のDIVのLEFT
                var defaultPositionY  = 0; //ドラッグ開始時のDIVのTOP
                var isDragging = false;
                
                $(window).scroll(function(e) {
                    scrolledTop  = $(window).scrollTop();
                    scrolledLeft = $(window).scrollLeft();
                    
                    divFixedMessage.css('top' , differenceY + scrolledTop + 'px');
                    divFixedMessage.css('left', differenceX + scrolledLeft + 'px');
                });
                
                $(divFixedMessage).mousedown(function(e) {
                    isDragging = true;
                    
                    defaultPositionX = pxToNum( $(divFixedMessage).css('left') );
                    defaultPositionY = pxToNum( $(divFixedMessage).css('top') );
                    
                    startPositionX = e.pageX;
                    startPositionY = e.pageY;
                });
                
                $(window).mousemove(function(e) {
                    if ( isDragging ) {
                        movePositionX = e.pageX - startPositionX;
                        movePositionY = e.pageY - startPositionY;
                        
                        $(divFixedMessage).css('left', movePositionX + defaultPositionX + 'px');
                        $(divFixedMessage).css('top' , movePositionY + defaultPositionY + 'px');
                        
                        differenceX = (movePositionX + defaultPositionX) - $(window).scrollLeft();
                        differenceY = (movePositionY + defaultPositionY) - $(window).scrollTop();
                    }
                });
                
                $(divFixedMessage).mouseup( function(e) {
                    isDragging = false;
                } );
            }
            
            //ページ離脱時のアラート
            if ( undefined != defaults.config.showUnloadConfirm && true == defaults.config.showUnloadConfirm ) {
                var execBeforeUnload = true;
                $(window).bind('beforeunload', function(e) {
                    if (execBeforeUnload) {
                        return '';
                    }
                });

                $(document).ready(function() {
                    $('a').click(function(e) {
                        if (e.target.href && e.target.href.indexOf("javascript") === 0) {
                            cancelBeforeUnload();
                        }
                    });
                });

                function cancelBeforeUnload() {
                    execBeforeUnload = false;
                    setTimeout(function() {
                        execBeforeUnload = true;
                    }, 0);
                }
            }
            
            var input;          //設定
            var current_input;  //入力フォーム
            var type;           //入力チェック内容
            var alertName;
            var offset;
            for (i = 0; i < defaults.config.inputs.length; i++) {
                input         = defaults.config.inputs[i];
                if ( undefined != input.name ) {
                    current_input = $(':input[name=' + input.name + ']');
                    
                    if ( undefined != input.message && 0 != input.message.length ) {
                        alertName = 'alert_' + input.name;
                        
                        offset = $(current_input).offset();
                        
                        alertChip[alertName] = divAlertChip(input.message, offset.top, offset.left);
                    }
                    
                    type          = input.type;
                    
                    if ( undefined != input.max ) {
                        if ( 'TEXTAREA' == $(current_input)[0].tagName
                            || ('INPUT' == $(current_input)[0].tagName
                                && 'text' == $(current_input).attr('type')) ) {
                            $(current_input).attr('maxlength', input.max);
                        }
                    }
                    
                    if ( undefined != input.type ) {
                        switch (type) {
                            case 'zenkana':
                                $(current_input).bind('change keyup', function(e) {
                                    if ( (e.type == 'keyup' && e.keyCode == 13) || e.type == 'change' ) {
                                        f.convertZenkana(this);
                                    }
                                });
                                break;
                            case 'hiragana':
                                $(current_input).bind('change keyup', function(e) {
                                    if ( (e.type == 'keyup' && e.keyCode == 13) || e.type == 'change' ) {
                                        f.convertHiragana(this);
                                    }
                                });
                                break;
                            case 'halfkana':
                                $(current_input).bind('change keyup', function(e) {
                                    if ( (e.type == 'keyup' && e.keyCode == 13) || e.type == 'change' ) {
                                        f.convertHalfkana(this);
                                    }
                                });
                                break;
                            case 'email':
                                $(current_input).bind('change keyup', function(e) {
                                    if ( (e.type == 'keyup' && e.keyCode == 13) || e.type == 'change' ) {
                                        f.convertEmail(this);
                                    }
                                });
                                break;
                            case 'zip1':
                            case 'zip2':
                            case 'zip':
                            case 'tel1':
                            case 'tel2':
                            case 'tel3':
                            case 'tel':
                                $(current_input).bind('change keyup', input, function(e) {
                                    if ( (e.type == 'keyup' && e.keyCode == 13) || e.type == 'change' ) {
                                        f.convertDigit(this);
                                    }
                                    
                                    if ( (48 <= e.keyCode && 57 >= e.keyCode) || e.keyCode == 8 || e.keyCode == 13 ) {
                                        if ( 'zip1' == e.data.type || 'zip2' == e.data.type || 'zip' == e.data.type ) {
                                            f.zipAssist(this, e.data);
                                        } else if ( 'tel1' == e.data.type || 'tel2' == e.data.type || 'tel3' == e.data.type ) {
                                            f.telCheck();
                                        }
                                    }
                                });
                                break;
                            case 'city':
                                city = current_input;
                                break;
                        }
                    }
                    
                    f.check(current_input, input, false);
                    $(current_input).bind('change blur', input, function(e) {
                        f.check(this, e.data, defaults.config.showAlertChip);
                    });
                }
            }
        }
        
        if ( typeof config == 'object' ) {
            init(config);
        } else if ( typeof config == 'string' ) {
            if ( null != config.match(/\.json$/) ) {
                $.ajax({
                    url : config,
                    type: 'get',
                    dataType: 'json',
                    success : function(json) {
                        init(json);
                    }
                });
            }
        }
    }
    
    $.fn.assist.setAryZipJson = function(ary) {
        aryZipJson = ary;
    }
    
    $.fn.assist.setIsLoadingJsonp = function(bool) {
        isLoadingJsonp = bool;
    }
    
    $.fn.assist.f = f;
    $.fn.assist.defaults = defaults;
    
    $(function() {
        if (typeof onLoadAtAssist == 'function') {
            onLoadAtAssist();
        }
    })
})();

//JSONPが読み込まれた時に呼ばれるcallback関数
var atFormAssistCallback = function(json) {
    $.fn.assist.setIsLoadingJsonp(false);
    
    var zip1, zip2;
    
    if ( typeof json.request != 'undefined' ) {
        var aryZip = json.request.match(/^([0-9]{3})([0-9]*)$/);
        zip1 = aryZip[1];
        zip2 = aryZip[2];
    }
    
    if ( typeof json.zip_code != 'undefined' ) {
        $.fn.assist.setAryZipJson(json);
        $.fn.assist.f.showZipAssist(zip1, zip2);
    }
}