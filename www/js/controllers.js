"use strict";

angular.module('app.controllers', [])

    .controller('MenuCtrl', function ($scope, $state, PatientService) {
        $scope.showPatient = function () {
            $state.go('app.patient', {
                patientId: PatientService.currentId
            });
        };
    })

    .controller('HomeCtrl', function ($scope, $state) {
        $scope.goSearch = function () {
            $state.go('app.search');
        }
    })

    .controller('SearchCtrl', function ($scope, $timeout, PatientService) {
        $scope.vm = {
            patients: [],
            query: ''
        };

        var timer = false;
        $scope.$watch('vm.query', function () {
            if (timer) {
                $timeout.cancel(timer);
            }
            timer = $timeout($scope.onSearch, 250)
        });

        $scope.onSearch = function () {
            if ($scope.vm.query) {
                PatientService
                    .filter($scope.vm.query)
                    .then(function (model) {
                        $scope.vm.patients = model;
                    });
            };
        }
    })

    .controller('PatientCtrl', function ($scope, $stateParams, $ionicModal, PatientService, CdsiService) {

        $scope.vaccination = {
            cvxOptions: CdsiService.asOptions(),
            selectedCvx: {},
            administeredDate: null
        };

        $scope.$on('$ionicView.beforeEnter', function () {
            if ($stateParams.patientId) {
                $scope.hasData = true;
                PatientService
                    .read($stateParams.patientId)
                    .then(function (result) {
                        PatientService.currentId = result._id;
                        $scope.vm = result;
                    });
            } else {
                delete (PatientService.currentId);
                delete ($scope.vm);
            }
        });

        $ionicModal.fromTemplateUrl('templates/patient-edit.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.editModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/patient-vaccination.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.vaccinationModal = modal;
        });

        $scope.startVaccination = function () {
            $scope.vaccination.dateAdministered =  new Date();
            $scope.vaccination.selectedCvx = $scope.vaccination.cvxOptions[0];
            $scope.vaccinationModal.show();
        };

        $scope.finishVaccination = function () {
            $scope.vm.medical.series.push({
                Cvx: $scope.vaccination.selectedCvx.code,
                VaccineName: $scope.vaccination.selectedCvx.desc,
                DateAdministered: $scope.vaccination.dateAdministered
            });
            $scope.finishEdit();
        };

        $scope.startEdit = function () {
            $scope.editModal.show();
        };

        $scope.finishEdit = function () {
            PatientService
                .save($scope.vm)
                .then(function () {
                    $scope.editModal.hide();
                    $scope.vaccinationModal.hide();
                });
        };

        $scope.cancelEdit = function () {
            PatientService
                .read($scope.vm._id)
                .then(function (result) {
                    $scope.vm = result;
                    $scope.editModal.hide();
                    $scope.vaccinationModal.hide();
                });
        };
        
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.editModal.remove();
            $scope.vaccinationModal.remove();
        });
        
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
        });
        
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
        });
    })

    .controller('SettingsCtrl', function ($scope, SettingsService) {
        $scope.$on('$ionicView.beforeEnter', function () {
            if (!SettingsService.dbInfo) {
                SettingsService.infoDb();
            }

        });
        $scope.settings = SettingsService;
    });
