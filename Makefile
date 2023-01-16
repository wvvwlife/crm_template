GIT_PATH = .git;
GIT_SSH = git@github.com:wvvwlife/crm_template.git;

install:
	yarn install
clear:
	sudo rm -rf $(GIT_PATH)