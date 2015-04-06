var path = require("path");
module.exports = function (grunt) {


    grunt.initConfig({
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', '!**/*.less'],
                    dest: 'dist/'
                }]
            },
            demo: {
                files: [{
                    expand: true,
                    cwd: 'demo/',
                    src: ['**'],
                    dest: 'dist/demo/'
                }]
            }
        },
        cmd_transport: {
            options: {
                rootPath: path.join(process.cwd(), "dist"),
                paths: [
                    path.join(process.cwd(), "dist/page/"),
                    path.join(process.cwd(), "dist/pc/"),
                    path.join(process.cwd(), "dist/global/")
                ],
                // alias: {
                //     'global': 'global/global'
                // }
            },
            release: {
                files: [{
                    src: ["page/**/*.js", "pc/**/*.js", "global/**/*.js"],
                    dest: "dist/.cmd/",
                    expand: true,
                    ext: ".js",
                    cwd: "dist/",
                    filter: "isFile"
                }]
            }
        },
        cmd_concat: {
            options: {
                paths: [
                    path.normalize(path.join(__dirname, 'dist/.cmd/'))
                ],
                include: "relative"
            },
            release: {
                files: [{
                    expand: true,
                    src: ["page/**/*.js", "pc/**/*.js", "global/**/*.js"],
                    dest: "dist/",
                    cwd: "dist/.cmd/",
                    filter: "isFile"
                }]
            }
        },
        replace: {
            demo: {
                src: ["dist/demo/**/*.html", "dist/demo/**/*.htm"],
                overwrite: true,
                replacements: [{
                    from: "../../src/",
                    to: "http://123.57.40.10/m/"
                }]
            }
        },
        cssmin: {
            build: {
                options: {
                    banner: '/* build  <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.css', '!*.min.css'],
                    dest: 'dist/'
                }]
            }
        },
        uglify: {
            options: {
                beautify: {
                    ascii_only: true
                },
                banner: '/*! build <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['page/**/*.js', 'pc/**/*.js', 'global/**/*.js'],
                    dest: 'dist/'
                }]
            }
        },
        clean: {
            cmd: ['dist/.cmd'],
            dist: ['dist']
        }

    });

    grunt.loadNpmTasks('grunt-cmd-nice');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.registerTask('default', ['clean:dist', 'copy:main', 'cssmin', 'cmd_transport', 'cmd_concat', 'copy:demo', 'replace', 'uglify', 'clean:cmd']);
};