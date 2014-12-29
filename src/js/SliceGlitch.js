function SliceGlitch (opts) {
    opts = opts || {};

    this.$el = opts.$el || $('<div />');
    this.imagePath = opts.imagePath || this.$el.attr('data-glitch-image');
    this.ticker = opts.ticker || new Ticker({ clock: 20, auto: true });
    this.interval = isNaN(opts.interval) ? 1 : opts.interval;
    this.unit = opts.unit || 1;
    this.resolution = isNaN(opts.resolution) ? 1 : opts.resolution;
    this.intensity = opts.intensity || 0;

    if (!this.imagePath) {
        throw new Error('property "imagePath" is not found!');
    }
    
    this.init();
}
SliceGlitch = EventTrigger.extend(SliceGlitch);

SliceGlitch.prototype.init = function () {
    var instance = this;
    var $el = this.$el;

    var unit = this.unit;
    var resolution = this.resolution;

    var imagePath = this.imagePath;
    var image = new Image();
    image.src = imagePath;

    image.onload = function () {
        var width = image.width / resolution;
        var height = image.height / resolution;

        $el.empty();
        $el.css({
            backgroundImage: 'none'
        });

        var $spacer = $('<div />');
        $spacer.css('height', (($el.height() - height) / 2) + 'px');
        $el.append($spacer);
        
        var lines = [];
        var line;
        for (var i = 0; i < height / unit; i++) {
            line = document.createElement('div');
            line.style.height = unit + 'px';
            line.style.backgroundImage = 'url(' + imagePath + ')';
            if (resolution != 1) {
                line.style.backgroundSize = [width + 'px', height + 'px'].join(' ');
            }
            line.style.backgroundPosition =  ['0px', (-i * unit) + 'px'].join(' ');
            line.style.backgroundRepeat =  'no-repeat';
            $el.append(line);
            lines.push(line);
        }

        instance.lines = lines;
        instance.trigger('loaded');
    };
};

SliceGlitch.prototype.setImage = function (imagePath) {
    if (this.imagePath === imagePath) {
        return;
    }

    this.imagePath = imagePath;
    this.init();
};

SliceGlitch.prototype.start = function (intensity) {
    this.intensity = intensity || this.intensity;

    var instance = this;
    var clock = this.clock;
    var interval = this.interval;

    if (this.loop) {
        this.stop();
    }

    var counter = 0;
    this.loop = function (e) {
        counter += e.delta;
        if (counter >= interval) {
            counter -= interval;
            instance.noise();
        }
    };
    this.ticker.on('tick', this.loop);
};

SliceGlitch.prototype.stop = function () {
    this.noise(0);

    this.ticker.off('tick', this.loop);
    this.loop = null;
};

SliceGlitch.prototype.noise = function (intensity) {
    intensity = isNaN(intensity) ? this.intensity : intensity;

    var lines = this.lines;
    var unit = this.unit;

    $.each(lines, function (index, line) {
        line.style.backgroundPosition = [
            (-intensity + Math.random() * 2 * intensity) + 'px',
            (-index * unit) + 'px'
        ].join(' ');
    });
};
